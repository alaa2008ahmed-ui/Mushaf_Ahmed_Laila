import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

export const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true
}, firebaseConfig.firestoreDatabaseId || "(default)");

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged };
export type { FirebaseUser };
