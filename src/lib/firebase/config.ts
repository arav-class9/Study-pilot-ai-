import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

let firestoreInstance: any;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
      // Use standard auto-detecting transport to prevent long-polling hang timeouts
      experimentalAutoDetectLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch (err) {
  console.warn('[FIRESTORE] Initializing fallback firestore cache:', err);
  try {
    firestoreInstance = initializeFirestore(
      app,
      { experimentalAutoDetectLongPolling: true },
      firebaseConfig.firestoreDatabaseId
    );
  } catch (secondaryErr) {
    console.warn('[FIRESTORE] Using standard firestore:', secondaryErr);
    firestoreInstance = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);
  }
  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(firestoreInstance).catch((pErr) => {
      console.warn('[FIRESTORE] IndexedDb persistence init info:', pErr?.message);
    });
  }
}

export const db = firestoreInstance;
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

