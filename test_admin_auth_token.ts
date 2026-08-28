import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
dotenv.config();

initializeApp({
  projectId: process.env.VITE_FIREBASE_PROJECT_ID
});

async function test() {
  try {
    const auth = getAuth();
    console.log('Auth initialized');
    // Just a dummy token to see if it makes a network request and fails with permission denied, or fails with invalid token
    await auth.verifyIdToken('dummy');
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
