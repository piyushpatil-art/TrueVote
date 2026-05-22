// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TrueVote — isolated multi-election voting with per-election whitelists
contract TrueVote {
    address public admin;
    uint256 public electionCount;

    enum ElectionStatus {
        Draft,  // 0 — setup candidates & voters
        Active, // 1 — voting open
        Ended   // 2 — closed
    }

    struct Election {
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool finalized;
        ElectionStatus status;
        uint256 candidateCount;
    }

    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
        bool exists;
    }

    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;
    mapping(uint256 => mapping(address => bool)) public voted;
    mapping(uint256 => mapping(address => bool)) public approvedVoters;

    event ElectionCreated(
        uint256 indexed electionId,
        string title,
        uint256 startTime,
        uint256 endTime
    );
    event ElectionFinalized(uint256 indexed electionId);
    event ElectionActivated(uint256 indexed electionId);
    event ElectionEnded(uint256 indexed electionId);
    event CandidateAdded(
        uint256 indexed electionId,
        uint256 indexed candidateId,
        string name
    );
    event CandidateUpdated(uint256 indexed electionId, uint256 indexed candidateId);
    event CandidateRemoved(uint256 indexed electionId, uint256 indexed candidateId);
    event VoterApproved(uint256 indexed electionId, address indexed voter);
    event VoterRemoved(uint256 indexed electionId, address indexed voter);
    event VoteCast(
        uint256 indexed electionId,
        address indexed voter,
        uint256 indexed candidateId
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier validElection(uint256 electionId) {
        require(electionId > 0 && electionId <= electionCount, "Invalid election");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // ─── Election lifecycle ───────────────────────────────────────────

    function createElection(
        string calldata title,
        string calldata description,
        uint256 startTime,
        uint256 endTime
    ) external onlyAdmin returns (uint256 electionId) {
        require(bytes(title).length > 0, "Title required");
        require(endTime > startTime, "End must be after start");
        electionCount++;
        electionId = electionCount;
        elections[electionId] = Election({
            title: title,
            description: description,
            startTime: startTime,
            endTime: endTime,
            finalized: false,
            status: ElectionStatus.Draft,
            candidateCount: 0
        });
        emit ElectionCreated(electionId, title, startTime, endTime);
    }

    function finalizeElection(uint256 electionId)
        external
        onlyAdmin
        validElection(electionId)
    {
        Election storage e = elections[electionId];
        require(e.status == ElectionStatus.Draft, "Not in draft");
        require(!e.finalized, "Already finalized");
        require(e.candidateCount > 0, "Add candidates first");
        e.finalized = true;
        emit ElectionFinalized(electionId);
    }

    function activateElection(uint256 electionId)
        external
        onlyAdmin
        validElection(electionId)
    {
        Election storage e = elections[electionId];
        require(e.status == ElectionStatus.Draft, "Not in draft");
        require(e.finalized, "Finalize first");
        require(e.candidateCount > 0, "No candidates");
        e.status = ElectionStatus.Active;
        emit ElectionActivated(electionId);
    }

    function endElection(uint256 electionId)
        external
        onlyAdmin
        validElection(electionId)
    {
        Election storage e = elections[electionId];
        require(e.status == ElectionStatus.Active, "Not active");
        e.status = ElectionStatus.Ended;
        emit ElectionEnded(electionId);
    }

    // ─── Candidates (draft only, before finalize) ───────────────────────

    function addCandidate(
        uint256 electionId,
        string calldata name,
        string calldata party
    ) external onlyAdmin validElection(electionId) {
        Election storage e = elections[electionId];
        require(e.status == ElectionStatus.Draft, "Not in draft");
        require(!e.finalized, "Election finalized");
        require(bytes(name).length > 0, "Name required");
        e.candidateCount++;
        uint256 candidateId = e.candidateCount;
        candidates[electionId][candidateId] = Candidate({
            id: candidateId,
            name: name,
            party: party,
            voteCount: 0,
            exists: true
        });
        emit CandidateAdded(electionId, candidateId, name);
    }

    function updateCandidate(
        uint256 electionId,
        uint256 candidateId,
        string calldata name,
        string calldata party
    ) external onlyAdmin validElection(electionId) {
        Election storage e = elections[electionId];
        require(e.status == ElectionStatus.Draft && !e.finalized, "Locked");
        Candidate storage c = candidates[electionId][candidateId];
        require(c.exists, "Invalid candidate");
        require(bytes(name).length > 0, "Name required");
        c.name = name;
        c.party = party;
        emit CandidateUpdated(electionId, candidateId);
    }

    function removeCandidate(uint256 electionId, uint256 candidateId)
        external
        onlyAdmin
        validElection(electionId)
    {
        Election storage e = elections[electionId];
        require(e.status == ElectionStatus.Draft && !e.finalized, "Locked");
        Candidate storage c = candidates[electionId][candidateId];
        require(c.exists, "Invalid candidate");
        c.exists = false;
        emit CandidateRemoved(electionId, candidateId);
    }

    // ─── Voter whitelist ────────────────────────────────────────────────

    function approveVoter(uint256 electionId, address voter)
        external
        onlyAdmin
        validElection(electionId)
    {
        require(voter != address(0), "Invalid address");
        require(
            elections[electionId].status != ElectionStatus.Ended,
            "Election ended"
        );
        approvedVoters[electionId][voter] = true;
        emit VoterApproved(electionId, voter);
    }

    function removeVoter(uint256 electionId, address voter)
        external
        onlyAdmin
        validElection(electionId)
    {
        approvedVoters[electionId][voter] = false;
        emit VoterRemoved(electionId, voter);
    }

    function approveVotersBatch(uint256 electionId, address[] calldata voters)
        external
        onlyAdmin
        validElection(electionId)
    {
        require(
            elections[electionId].status != ElectionStatus.Ended,
            "Election ended"
        );
        for (uint256 i = 0; i < voters.length; i++) {
            address voter = voters[i];
            if (voter != address(0)) {
                approvedVoters[electionId][voter] = true;
                emit VoterApproved(electionId, voter);
            }
        }
    }

    // ─── Voting ─────────────────────────────────────────────────────────

    function castVote(uint256 electionId, uint256 candidateId) external validElection(electionId) {
        Election storage e = elections[electionId];
        require(e.status == ElectionStatus.Active, "Voting not active");
        require(
            block.timestamp >= e.startTime && block.timestamp <= e.endTime,
            "Outside voting window"
        );
        require(approvedVoters[electionId][msg.sender], "Not approved voter");
        require(!voted[electionId][msg.sender], "Already voted");
        Candidate storage c = candidates[electionId][candidateId];
        require(c.exists, "Invalid candidate");
        voted[electionId][msg.sender] = true;
        c.voteCount++;
        emit VoteCast(electionId, msg.sender, candidateId);
    }

    // ─── Views ──────────────────────────────────────────────────────────

    function getElection(uint256 electionId)
        external
        view
        validElection(electionId)
        returns (
            string memory title,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            bool finalized,
            uint8 status,
            uint256 candidateCount
        )
    {
        Election storage e = elections[electionId];
        return (
            e.title,
            e.description,
            e.startTime,
            e.endTime,
            e.finalized,
            uint8(e.status),
            e.candidateCount
        );
    }

    function getCandidate(uint256 electionId, uint256 candidateId)
        external
        view
        returns (string memory name, string memory party, uint256 voteCount, bool exists)
    {
        Candidate storage c = candidates[electionId][candidateId];
        return (c.name, c.party, c.voteCount, c.exists);
    }

    function isApprovedVoter(uint256 electionId, address voter) external view returns (bool) {
        return approvedVoters[electionId][voter];
    }

    function hasVoted(uint256 electionId, address voter) external view returns (bool) {
        return voted[electionId][voter];
    }

    function canVote(uint256 electionId, address voter)
        external
        view
        returns (bool allowed, string memory reason)
    {
        if (electionId == 0 || electionId > electionCount) {
            return (false, "Invalid election");
        }
        Election storage e = elections[electionId];
        if (e.status != ElectionStatus.Active) {
            return (false, "Election is not active");
        }
        if (block.timestamp < e.startTime) {
            return (false, "Voting has not started");
        }
        if (block.timestamp > e.endTime) {
            return (false, "Voting period ended");
        }
        if (!approvedVoters[electionId][voter]) {
            return (false, "Wallet not on voter whitelist");
        }
        if (voted[electionId][voter]) {
            return (false, "Already voted in this election");
        }
        return (true, "");
    }
}
