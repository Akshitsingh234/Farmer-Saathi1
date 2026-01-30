"use client";

import { useSession } from "@/context/session-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { Sidebar } from "./sidebar";

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return; // Don't do anything while session is loading
    }

    // If user is not logged in and not on the login page, redirect to login
    if (!session.isLoggedIn && pathname !== "/login") {
      router.push("/login");
    }

    // If user is logged in and on the login page, redirect to the home page
    if (session.isLoggedIn && pathname === "/login") {
      router.push("/");
    }
  }, [session.isLoggedIn, pathname, router, loading]);

  // While loading or during a pending redirect, render nothing (or a loading spinner)
  if (loading || (!session.isLoggedIn && pathname !== "/login") || (session.isLoggedIn && pathname === "/login")) {
    return null;
  }

  // If the user is on the login page and not logged in, show the page
  if (!session.isLoggedIn && pathname === "/login") {
    return <>{children}</>;
  }

  // If the user is logged in and not on the login page, show the protected content
  return (
    <>
      <SiteHeader />
      <Sidebar />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </>
  );
}
