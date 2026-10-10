import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let firebaseAdminInitialized = false;

function cleanString(val?: string | null): string {
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

function cleanPrivateKey(rawKey?: string | null): string | undefined {
  if (!rawKey) return undefined;
  let key = cleanString(rawKey);
  // Convert escaped newlines (\n) to actual newlines
  key = key.replace(/\\n/g, '\n').trim();
  // Strip any remaining wrapping quotes
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  // Check that the PEM boundaries exist
  if (!key.includes('-----BEGIN') || !key.includes('-----END')) {
    console.warn('[Firebase Admin] FIREBASE_PRIVATE_KEY is missing PEM header/footer.');
    return undefined;
  }
  return key;
}

try {
  if (!getApps().length) {
    const projectId =
      cleanString(process.env.FIREBASE_PROJECT_ID) ||
      cleanString(process.env.VITE_FIREBASE_PROJECT_ID);
    const clientEmail = cleanString(process.env.FIREBASE_CLIENT_EMAIL);
    const privateKey = cleanPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    if (clientEmail && privateKey) {
      try {
        adminApp = initializeApp({
          credential: cert({
            projectId: projectId || undefined,
            clientEmail,
            privateKey,
          }),
        });
        adminAuth = getAuth(adminApp);
        firebaseAdminInitialized = true;
        console.log('[Firebase Admin] Successfully initialized with Service Account for project:', projectId || 'default');
      } catch (certErr) {
        console.error('[Firebase Admin] Error initializing with Service Account credential:', certErr);
        // Fallback to project ID only if available
        if (projectId) {
          try {
            adminApp = initializeApp({ projectId });
            adminAuth = getAuth(adminApp);
            firebaseAdminInitialized = true;
            console.log('[Firebase Admin] Fallback initialized with Project ID only:', projectId);
          } catch (projErr) {
            console.error('[Firebase Admin] Fallback Project ID initialization failed:', projErr);
          }
        }
      }
    } else if (projectId) {
      adminApp = initializeApp({
        projectId,
      });
      adminAuth = getAuth(adminApp);
      firebaseAdminInitialized = true;
      console.log('[Firebase Admin] Initialized with Project ID:', projectId);
    } else {
      console.warn('[Firebase Admin] Credentials not configured yet. Running in development mode.');
    }
  } else {
    adminApp = getApps()[0];
    adminAuth = getAuth(adminApp);
    firebaseAdminInitialized = true;
  }
} catch (error) {
  console.error('[Firebase Admin] Initialization error:', error);
}

export const isFirebaseAdminReady = () => firebaseAdminInitialized && adminAuth !== null;
export const getAdminAuth = () => adminAuth;
