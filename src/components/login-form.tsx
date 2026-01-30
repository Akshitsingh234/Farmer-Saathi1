"use client";

// inside components/login-form.tsx (top)
import { auth, saveUserToFirestore } from "@/firebase";
// or if your index is at src/firebase/index.ts and alias differs:
// import { auth, saveUserToFirestore, useAuth } from "@/firebase/index";

import { useState } from "react";
import { useAuth } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState(""); // Add displayName state
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const auth = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        // Update the user's profile with the display name
        await updateProfile(userCredential.user, { displayName });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/");
    } catch (err: any) {
      // Normalize Firebase messages a bit for end users
      setError(err?.message ?? "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // GOOGLE SIGN IN
  const handleGoogleSignIn = async () => {
  setError("");
  setLoading(true);
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // Save/update user in Firestore (useful to link inventory & permissions)
    await saveUserToFirestore({
      uid: result.user.uid,
      displayName: result.user.displayName ?? null,
      email: result.user.email ?? null,
      photoURL: result.user.photoURL ?? null,
    });

    router.push("/");
  } catch (err: any) {
    if (err?.code === "auth/popup-closed-by-user") {
      setError("Popup closed before completing sign in.");
    } else {
      setError(err?.message ?? "Google sign-in failed");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center">
        {isSignUp ? "Sign Up" : "Login"}
      </h1>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md shadow-sm hover:bg-gray-50"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 533.5 544.3"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.3-4.6-50.6H272v95.8h147.1c-6.4 34.6-25.7 63.9-54.9 83.5v69.4h88.6c51.8-47.8 81.7-118 81.7-198.1z"/>
            <path fill="#34A853" d="M272 544.3c73 0 134.2-24.1 178.9-65.5l-88.6-69.4c-24.6 16.5-56.2 26.2-90.3 26.2-69.5 0-128.4-46.9-149.4-110.2H33.5v69.7C78.2 486.9 168.9 544.3 272 544.3z"/>
            <path fill="#FBBC05" d="M122.6 330.4c-10.7-31.8-10.7-66 0-97.8V162.9H33.5c-39.8 78.7-39.8 171.2 0 249.9l89.1-82.4z"/>
            <path fill="#EA4335" d="M272 107.7c38.7 0 73.6 13.3 101.1 39.3l75.8-75.8C402 27.9 337 0 272 0 168.9 0 78.2 57.4 33.5 144.8l89.1 82.4C143.6 154.6 202.5 107.7 272 107.7z"/>
          </svg>
          Continue with Google
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {isSignUp && (
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-gray-700"
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        )}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Login"}
          </button>
        </div>
      </form>

      <div className="text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-orange-600 hover:underline"
        >
          {isSignUp
            ? "Already have an account? Login"
            : "Don't have an account? Sign Up"}
        </button>
      </div>

      {auth.currentUser && (
        <div className="text-center">
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 mt-4 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
