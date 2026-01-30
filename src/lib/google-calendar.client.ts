
'use client';

import { getAuth, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';

export const getOauthToken = async () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (currentUser) {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/calendar');
      const result = await reauthenticateWithPopup(currentUser, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      return credential?.accessToken;
    } catch (error) {
      console.error('Error re-authenticating with Google', error);
    }
  }
  return null;
};
