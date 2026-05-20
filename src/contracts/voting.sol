// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {

    // --- Data ---
    struct Candidate {
        uint id;
        string name;
        string description;
        string photoUrl;
        uint voteCount;
    }

    struct Election {
        string name;
        bool isActive;
        uint candidateCount;
    }

    Election public election;
    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public hasVoted;
    uint public candidateCount;
    address public admin;

    // --- Events (like notifications) ---
    event VoteCast(address voter, uint candidateId);
    event ElectionCreated(string name);

    // --- Setup ---
    constructor() {
        admin = msg.sender;
    }

    // --- Admin creates the election ---
    function createElection(string memory _name) public {
        require(msg.sender == admin, "Only admin can create election");
        election = Election(_name, true, 0);
        emit ElectionCreated(_name);
    }

    // --- Admin adds candidates ---
    function addCandidate(
        string memory _name, 
        string memory _description,
        string memory _photoUrl
    ) public {
        require(msg.sender == admin, "Only admin can add candidates");
        candidateCount++;
        candidates[candidateCount] = Candidate(
            candidateCount, 
            _name, 
            _description,
            _photoUrl, 
            0
        );
    }

    // --- Voter casts vote ---
    function castVote(uint _candidateId) public {
        require(election.isActive, "Election is not active");
        require(!hasVoted[msg.sender], "You have already voted!");
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate");
description,
        string memory photoUrl,
        uint voteCount
    ) {
        Candidate memory c = candidates[_id];
        return (c.name, c.description, c.photoUrlr, _candidateId);
    }

    // --- Get results ---
    function getCandidate(uint _id) public view returns (
        string memory name,
        string memory party,
        uint voteCount
    ) {
        Candidate memory c = candidates[_id];
        return (c.name, c.party, c.voteCount);
    }

    // --- End election ---
    function endElection() public {
        require(msg.sender == admin, "Only admin can end election");
        election.isActive = false;
    }
}