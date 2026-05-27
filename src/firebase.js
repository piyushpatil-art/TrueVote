import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBmKMAP6Qkzq2eZoPUaLWFKqFUlNCCAc1A",
  authDomain: "truevote-487e1.firebaseapp.com",
  projectId: "truevote-487e1",
  storageBucket: "truevote-487e1.firebasestorage.app",
  messagingSenderId: "1066952711243",
  appId: "1:1066952711243:web:552f0bbaeed8b765e801ce"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ─── VOTER WHITELIST FUNCTIONS ───────────────────────────

// Add voter to whitelist for specific election
export const addVoterToWhitelist = async (electionId, voterAddress) => {
  const id = `${electionId}_${voterAddress.toLowerCase()}`;
  await setDoc(doc(db, 'whitelist', id), {
    electionId,
    address: voterAddress.toLowerCase(),
    addedAt: new Date().toISOString()
  });
};

// Remove voter from whitelist
export const removeVoterFromWhitelist = async (electionId, voterAddress) => {
  const id = `${electionId}_${voterAddress.toLowerCase()}`;
  await deleteDoc(doc(db, 'whitelist', id));
};

// Check if voter is whitelisted
export const isVoterWhitelisted = async (electionId, voterAddress) => {
  const id = `${electionId}_${voterAddress.toLowerCase()}`;
  const docSnap = await getDoc(doc(db, 'whitelist', id));
  return docSnap.exists();
};

// Get all whitelisted voters for an election
export const getWhitelistedVoters = async (electionId) => {
  const q = query(
    collection(db, 'whitelist'),
    where('electionId', '==', electionId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};