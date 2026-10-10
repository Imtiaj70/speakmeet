import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  Auth,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';

function cleanEnv(val?: string | null): string {
  if (!val) return '';
  let s = val.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

const firebaseConfig = {
  apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID),
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'MY_FIREBASE_API_KEY'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    // Configure persistence
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('[Firebase Auth] Persistence setup error:', err);
    });
    console.log('[Firebase Client] Successfully initialized Firebase Auth for project:', firebaseConfig.projectId);
  } catch (error) {
    console.error('[Firebase] Failed to initialize client SDK:', error);
  }
} else {
  console.info(
    '[Firebase Auth] Environment variables (VITE_FIREBASE_*) are not fully configured yet. Operating in developer mode with demo authentication fallback enabled.'
  );
}

export { app, auth, googleProvider };
