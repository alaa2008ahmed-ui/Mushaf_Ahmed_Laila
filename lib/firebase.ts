import { initializeApp, setLogLevel } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signInWithCredential,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Mandatory, locked original Firebase server configuration to prevent database separation across accounts
const MANDATORY_ORIGINAL_CONFIG = {
  projectId: "dialy-sales",
  appId: "1:900314310640:web:566a671c9684cbad231f35",
  apiKey: "AIzaSyBXp4xCa0bpa8ruNmT6DKZDW2qt0KeIMDg",
  authDomain: "dialy-sales.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-remixquranlastve-8c0a020f-d488-4d96-b691-211204f62585",
  storageBucket: "dialy-sales.firebasestorage.app",
  messagingSenderId: "900314310640",
  oAuthClientId: "900314310640-aakjat6siqgbgg1ddv54ajh8f30rc34o.apps.googleusercontent.com"
};

// Enforce original server configuration
export const activeFirebaseConfig = {
  ...firebaseConfig,
  ...MANDATORY_ORIGINAL_CONFIG
};

// Set logging level to silent to suppress internal retry/connection logs from Firebase SDK
try {
  setLogLevel("silent");
} catch (e) {}

// Intercept and silence Firebase connectivity warning & error logs from showing in the console
if (typeof window !== 'undefined' && window.console) {
  const isFirestoreNetworkNoise = (args: any[]) => {
    return args.some(arg => {
      if (typeof arg === 'string') {
        return (
          arg.includes('@firebase/firestore') ||
          arg.includes('Could not reach Cloud Firestore backend') ||
          arg.includes('code=unavailable') ||
          arg.includes('The operation could not be completed') ||
          arg.includes('operate in offline mode')
        );
      }
      if (arg && typeof arg === 'object') {
        const msg = arg.message || arg.stack || '';
        return (
          msg.includes('Could not reach Cloud Firestore backend') ||
          msg.includes('code=unavailable') ||
          msg.includes('The operation could not be completed')
        );
      }
      return false;
    });
  };

  const originalWarn = window.console.warn;
  window.console.warn = function (...args) {
    if (isFirestoreNetworkNoise(args)) return;
    originalWarn.apply(window.console, args);
  };

  const originalError = window.console.error;
  window.console.error = function (...args) {
    if (isFirestoreNetworkNoise(args)) return;
    originalError.apply(window.console, args);
  };

  const originalInfo = window.console.info;
  window.console.info = function (...args) {
    if (isFirestoreNetworkNoise(args)) return;
    originalInfo.apply(window.console, args);
  };
}

export const app = initializeApp(activeFirebaseConfig);

// Initialize Firestore with modern persistent multi-tab cache and force long-polling for reliable connectivity
export const db = initializeFirestore(
  app, 
  {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    }),
    experimentalForceLongPolling: true
  }, 
  activeFirebaseConfig.firestoreDatabaseId
);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { signInWithPopup, signInWithRedirect, signInWithCredential, getRedirectResult, signOut, onAuthStateChanged };
export type { FirebaseUser };
