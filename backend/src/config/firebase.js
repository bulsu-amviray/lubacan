import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let adminDb = null;
let isInitialized = false;

export function initFirebaseAdmin() {
  if (isInitialized) return adminDb;

  const databaseURL = process.env.FIREBASE_DATABASE_URL;
  const defaultKeyPath = path.resolve(__dirname, '../../firebase-service-account.json');
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || defaultKeyPath;

  if (!databaseURL) {
    console.info('[Firebase Admin] Notice: FIREBASE_DATABASE_URL not set in backend/.env. Running with fallback.');
    return null;
  }

  try {
    let credential = null;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
    } else if (fs.existsSync(serviceAccountPath)) {
      const fileData = fs.readFileSync(serviceAccountPath, 'utf8');
      credential = admin.credential.cert(JSON.parse(fileData));
    } else {
      console.info(`[Firebase Admin] Service account file not yet found at: ${serviceAccountPath}`);
      return null;
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential,
        databaseURL
      });
    }

    adminDb = admin.database();
    isInitialized = true;
    console.log(`[Firebase Admin] Initialized Realtime Database: ${databaseURL}`);
    return adminDb;
  } catch (err) {
    console.warn('[Firebase Admin] Initialization warning:', err.message);
    return null;
  }
}

export function getAdminDb() {
  if (!isInitialized) {
    return initFirebaseAdmin();
  }
  return adminDb;
}

/**
 * Universal backend helper to synchronize writes live to Firebase Realtime Database.
 * Attempts to use the Firebase Admin SDK if initialized, or falls back to direct HTTPS REST fetch.
 */
export async function syncToFirebase(nodePath, data, method = 'PATCH') {
  const dbUrl = (process.env.FIREBASE_DATABASE_URL || 'https://lubacanfindit-default-rtdb.firebaseio.com').replace(/\/+$/, '');
  const cleanPath = nodePath.replace(/^\/+/, '').replace(/\/+$/, '');
  const payload = { ...data, updatedAt: new Date().toISOString() };

  // 1. Try Firebase Admin SDK if available
  const adminDbInstance = getAdminDb();
  if (adminDbInstance) {
    try {
      if (method === 'PUT' || method === 'SET') {
        await adminDbInstance.ref(cleanPath).set(payload);
      } else {
        await adminDbInstance.ref(cleanPath).update(payload);
      }
      return true;
    } catch (err) {
      console.warn('[Firebase Admin SDK sync notice]:', err.message);
    }
  }

  // 2. Direct REST HTTPS sync
  try {
    const res = await fetch(`${dbUrl}/${cleanPath}.json`, {
      method: method === 'SET' ? 'PUT' : method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.warn('[Firebase Backend REST sync notice]:', err.message);
    return false;
  }
}

