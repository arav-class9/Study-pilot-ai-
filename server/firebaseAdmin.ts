import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
dotenv.config();

if (getApps().length === 0) {
  try {
    initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID
    });
  } catch (err) {
    console.warn("Failed to initialize Firebase Admin with default credentials.");
  }
}

export const adminAuth = getAuth();
