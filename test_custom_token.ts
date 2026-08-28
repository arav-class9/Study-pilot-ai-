import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
dotenv.config();

initializeApp({
  projectId: process.env.VITE_FIREBASE_PROJECT_ID
});

async function test() {
  try {
    const auth = getAuth();
    const token = await auth.createCustomToken('test-uid-123');
    console.log('Token created successfully!');
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
