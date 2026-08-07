import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDq-dqaAGT2_7aQpFZDRBchDTjuQgt9N9I",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aura-health-20773.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aura-health-20773",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aura-health-20773.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "739469014973",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:739469014973:web:f4a1b9c963e4ad003204d4"
};

// Initialize Firebase Modular App safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export default app;
