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
      experimentalForceLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch (err) {
  console.warn('[FIRESTORE] Initializing fallback firestore cache:', err);
  firestoreInstance = initializeFirestore(
    app,
    { experimentalForceLongPolling: true },
    firebaseConfig.firestoreDatabaseId
  );
  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(firestoreInstance).catch((pErr) => {
      console.warn('[FIRESTORE] IndexedDb persistence init info:', pErr?.message);
    });
  }
}

export const db = firestoreInstance;
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

