import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, initializeAuth, browserLocalPersistence, browserPopupRedirectResolver } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver
});
export const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);

export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
