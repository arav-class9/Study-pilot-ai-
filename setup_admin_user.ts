import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function setup() {
  try {
    const cred = await createUserWithEmailAndPassword(auth, 'admin@backend.local', 'supersecretpassword');
    console.log('Created admin user:', cred.user.uid);
    process.exit(0);
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      try {
        const cred = await signInWithEmailAndPassword(auth, 'admin@backend.local', 'supersecretpassword');
        console.log('Logged in admin user:', cred.user.uid);
        process.exit(0);
      } catch (err) {
        console.error('Failed to login:', err.message);
        process.exit(1);
      }
    } else {
      console.error('Failed to create:', e.message);
      process.exit(1);
    }
  }
}
setup();
