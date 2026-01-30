'use server';
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { headers } from 'next/headers';

function getAdminApp(): App | null {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    // Don't throw here, as it will crash the server.
    // Let the calling function handle the null return.
    console.error('CRITICAL: Missing FIREBASE_SERVICE_ACCOUNT environment variable. Server-side Firebase features will be disabled.');
    return null;
  }

  try {
    return initializeApp({
      credential: cert(JSON.parse(serviceAccount)),
    });
  } catch (error) {
    console.error('CRITICAL: Failed to initialize Firebase Admin SDK. Please check the FIREBASE_SERVICE_ACCOUNT credentials.', error);
    return null;
  }
}

export async function getAuthenticatedFirestore() {
    const adminApp = getAdminApp();
    
    // If the admin app failed to initialize, we cannot proceed.
    if (!adminApp) {
        throw new Error('Server is not configured for database operations. The FIREBASE_SERVICE_ACCOUNT is missing or invalid.');
    }

    const auth = getAuth(adminApp);
    const db = getFirestore(adminApp);

    const idToken = (await headers()).get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
        throw new Error('User is not authenticated.');
    }

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        return { db, auth, artisanId: decodedToken.uid };
    } catch (error) {
        console.error("Error verifying ID token:", error);
        throw new Error("Invalid or expired authentication token.");
    }
}
