import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, process.env.VITE_FIREBASE_DATABASE_ID);

async function test() {
  try {
    const snap = await getDocs(collection(db, 'usageLimits'));
    console.log('Success:', snap.size);
  } catch (e) {
    console.error('Error fetching:', e.message);
  }
  process.exit(0);
}
test();
