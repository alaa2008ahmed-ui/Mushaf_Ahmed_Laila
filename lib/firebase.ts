import { initializeApp, setLogLevel } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
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
  apiKey: "AIzaSyDfe1Z37eOw6IuhrCw9cvwH1ATmxi_PHUU",
  authDomain: "moshaf-ahmed-laila.firebaseapp.com",
  projectId: "moshaf-ahmed-laila",
  storageBucket: "moshaf-ahmed-laila.firebasestorage.app",
  messagingSenderId: "820638063534",
  appId: "1:820638063534:web:599513548b6001ae69c63f",
  measurementId: "G-2FV41RK6VW",
  firestoreDatabaseId: "(default)"
};

// Enforce original server configuration permanently across AI Studio account transfers
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

// Initialize Firebase Analytics safely
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then(supported => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {}
    }
  }).catch(() => {});
}

// Initialize Firestore with modern persistent multi-tab cache and force long-polling for reliable connectivity
const databaseId = (!activeFirebaseConfig.firestoreDatabaseId || activeFirebaseConfig.firestoreDatabaseId === '(default)')
  ? undefined 
  : activeFirebaseConfig.firestoreDatabaseId;

export const db = initializeFirestore(
  app, 
  {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    }),
    experimentalForceLongPolling: true
  }, 
  databaseId
);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { signInWithPopup, signInWithRedirect, signInWithCredential, getRedirectResult, signOut, onAuthStateChanged };
export type { FirebaseUser };
