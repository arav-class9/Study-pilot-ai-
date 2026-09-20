import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
let databaseId = process.env.VITE_FIRESTORE_DATABASE_ID || process.env.FIRESTORE_DATABASE_ID;

try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!projectId && parsed.projectId) projectId = parsed.projectId;
    if (!databaseId && parsed.firestoreDatabaseId) databaseId = parsed.firestoreDatabaseId;
  }
} catch (e) {
  // ignore
}

if (getApps().length === 0) {
  try {
    initializeApp({
      projectId: projectId || 'gen-lang-client-0955688141'
    });
  } catch (err) {
    console.warn("Failed to initialize Firebase Admin with default credentials.", err);
  }
}

let adminAuthInstance: any;
let adminDbInstance: any;

try {
  const adminApp = getApps()[0];
  if (adminApp) {
    adminAuthInstance = getAuth(adminApp);
    adminDbInstance = databaseId ? getFirestore(adminApp, databaseId) : getFirestore(adminApp);
  }
} catch (err) {
  console.warn("Failed to bind Firebase Admin Auth/Firestore instances cleanly:", err);
}

export const adminAuth = adminAuthInstance || {
  verifyIdToken: async () => {
    throw new Error('Firebase Admin Auth is not initialized or configured.');
  },
};

export const adminDb = adminDbInstance || {
  collection: () => {
    throw new Error('Firebase Admin Firestore is not initialized.');
  },
};

export { FieldValue };

