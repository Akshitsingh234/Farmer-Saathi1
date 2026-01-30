
"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage, LanguageSwitcher } from "@/context/language-context";
import { useSession } from "@/context/session-context";
import { UserNav } from "./layout/user-nav";
import dynamic from 'next/dynamic';

const VoiceNavigation = dynamic(() => import('@/components/voice-navigation'), {
  ssr: false,
});

export function SiteHeader() {
  const { t } = useLanguage();
  const { session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
      <Link href="/" className="text-3xl font-extrabold bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent tracking-wide drop-shadow-md">
  Farmer Saathi
</Link>


        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <VoiceNavigation />
          {session.isLoggedIn ? (
            <UserNav />
          ) : (
            <Button asChild variant="ghost">
              <Link href="/login">{t("login.title")}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
