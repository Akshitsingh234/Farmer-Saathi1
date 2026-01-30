'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // Important! initializeApp() is called without any arguments because Firebase App Hosting
    // integrates with the initializeApp() function to provide the environment variables needed to
    // populate the FirebaseOptions in production. It is critical that we attempt to call initializeApp()
    // without arguments.
    let firebaseApp;
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      firebaseApp = initializeApp();
    } catch (e) {
      // Only warn in production because it's normal to use the firebaseConfig to initialize
      // during development
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

// ===== Add this to the end of src/firebase/index.ts =====

/**
 * Expose auth and firestore instances for easier imports throughout the app.
 * We call initializeFirebase() here so the SDKs are available wherever you import from "@/firebase".
 */
const sdks = initializeFirebase();
export const auth = sdks.auth;
export const db = sdks.firestore;

/**
 * Small convenience helper so existing code that expects useAuth() keeps working.
 * Not a React hook — just returns the auth instance.
 */
export const useAuth = () => auth;

/**
 * Save or update user profile in Firestore users collection.
 * Call this after sign-in (Google or email signup).
 */
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function saveUserToFirestore(user: {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}) {
  if (!user || !user.uid) return;
  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        name: user.displayName ?? null,
        email: user.email ?? null,
        photoURL: user.photoURL ?? null,
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Failed to save user to Firestore:", err);
  }
}

