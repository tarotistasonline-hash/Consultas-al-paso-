import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  User
} from "firebase/auth";
import { 
  initializeFirestore, 
  doc, 
  getDocFromServer,
  enableIndexedDbPersistence
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Analytics if supported (e.g. not server-side or in restricted iframe)
export const analyticsPromise = isSupported().then(supported => {
  if (supported && firebaseConfig.measurementId) {
    return getAnalytics(app);
  }
  return null;
}).catch(() => null);

// Initialize Auth & Firestore with Database-ID fallback (Critical constraint)
export const auth = getAuth(app);

// Use initializeFirestore with experimentalForceLongPolling to bypass WebSocket bans in strict iframe environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false,
}, firebaseConfig.firestoreDatabaseId);

// Enable offline persistence for seamless offline-first experience
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("Firestore persistence failed-precondition: Multiple tabs open.");
    } else if (err.code === "unimplemented") {
      console.warn("Firestore persistence unimplemented in this browser.");
    } else {
      console.warn("Firestore persistence error during initialization:", err);
    }
  });
} catch (e) {
  console.warn("IndexedDB offline persistence not supported or errored:", e);
}

// Google Sign-In Provider
export const googleProvider = new GoogleAuthProvider();

// Error classification as requested by the Firebase Skill Guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

// Connectivity confirmation on app startup
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.error("Please check your Firebase configuration: Client is offline.");
    }
  }
}
