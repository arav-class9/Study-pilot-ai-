import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
dotenv.config();

try {
  initializeApp({
    credential: applicationDefault(),
    projectId: process.env.VITE_FIREBASE_PROJECT_ID
  });
  console.log('App initialized');
  const db = getFirestore(getApps()[0], process.env.VITE_FIREBASE_DATABASE_ID);
  
  async function test() {
    try {
      const snap = await db.collection('usageLimits').limit(1).get();
      console.log('Success:', snap.size);
    } catch (e) {
      console.error('Error fetching:', e);
    }
  }
  test();
} catch(e) {
  console.error('Init error:', e);
}
