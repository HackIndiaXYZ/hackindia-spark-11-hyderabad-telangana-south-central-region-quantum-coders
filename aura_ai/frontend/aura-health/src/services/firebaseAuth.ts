import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type UserCredential
} from "firebase/auth";
import { auth } from "@/firebase/firebase";

export interface GoogleAuthResult {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  userCredential: UserCredential;
}

/**
 * Trigger Google Sign-In popup via Firebase Auth
 */
export async function loginWithGoogle(): Promise<GoogleAuthResult> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    return {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      userCredential: result
    };
  } catch (err: any) {
    if (err?.code === "auth/popup-closed-by-user") {
      console.warn("[Firebase Auth] Popup closed before completion by user or browser isolation.");
      throw new Error("Google Sign-In popup was closed. Please keep the window open to complete login.");
    } else if (err?.code === "auth/popup-blocked") {
      console.warn("[Firebase Auth] Popup blocked by browser policy.");
      throw new Error("Google Sign-In popup was blocked by your browser. Please allow popups for localhost.");
    }
    throw err;
  }
}

/**
 * Logout from Firebase Session
 */
export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
}

/**
 * Retrieve current active Firebase user
 */
export function getCurrentFirebaseUser() {
  return auth.currentUser;
}
