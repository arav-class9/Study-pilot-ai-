import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config();

initializeApp({
  credential: applicationDefault(),
  projectId: process.env.VITE_FIREBASE_PROJECT_ID
});

const db = getFirestore(getApps()[0]); // Default database

async function test() {
  try {
    const snap = await db.collection('test').limit(1).get();
    console.log('Success:', snap.size);
  } catch (e) {
    console.error('Error fetching:', e);
  }
}
test();
