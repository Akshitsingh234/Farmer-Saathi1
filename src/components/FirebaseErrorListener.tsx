"use client";

import { useState, useEffect } from "react";
import { errorEmitter } from "@/firebase/error-emitter";

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It throws any received error to be caught by Next.js's global-error.tsx.
 */
export function FirebaseErrorListener() {
  // Use a generic Error type for the state so this component does not
  // depend on Firebase-specific error types (keeps only the functionality
  // you implemented: listening to the global error emitter and throwing
  // errors to be handled by Next.js).
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // The callback expects a generic Error payload from the emitter.
    const handleError = (error: Error) => {
      // Set error in state to trigger a re-render.
      setError(error);
    };

    // The typed emitter will enforce that the callback for 'permission-error'
    // matches the expected payload type (FirestorePermissionError).
    errorEmitter.on("permission-error", handleError);

    // Unsubscribe on unmount to prevent memory leaks.
    return () => {
      errorEmitter.off("permission-error", handleError);
    };
  }, []);

  // On re-render, if an error exists in state, throw it.
  if (error) {
    throw error;
  }

  // This component renders nothing.
  return null;
}
