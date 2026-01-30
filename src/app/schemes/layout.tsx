"use client";

import { Leaf, Languages } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Header() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    // ## Updated Header Style ##
    // Uses the "glassmorphism" effect and our theme's border color
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-2 border-b border-stone-200/80 bg-white/70 px-4 backdrop-blur-lg md:px-6">
      
      <nav className="flex items-center gap-4">

        <Link
          href="/admin"
          className={cn(
            "text-sm font-medium transition-colors hover:text-rose-600",
            pathname === "/admin" ? "text-rose-600 font-bold" : "text-stone-700"
          )}
        >
          {t("adminPanel")}
        </Link>

        {/* ## Updated Language Dropdown ## */}
        
      </nav>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ## Updated Main Background ##
    // Applied the soft gradient background to the entire layout
    <div className="min-h-screen w-full bg-gradient-to-b from-[#FBF9F6] to-amber-50 text-stone-800">
      <Header />
      <main>{children}</main>
    </div>
  );
}
