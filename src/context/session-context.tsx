"use client";

import { createContext, useContext, ReactNode } from "react";
import { useUser } from "@/firebase";

interface Session {
  isLoggedIn: boolean;
  username: string | null;
}

interface SessionContextType {
  session: Session;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();

  const session: Session = {
    isLoggedIn: !!user,
    username: user ? user.displayName || user.email : null,
  };

  return (
    <SessionContext.Provider value={{ session, loading: isUserLoading }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
