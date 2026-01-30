"use client";

import { useSearchParams } from "next/navigation";

export function useDefaultTab() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "sourcing";

  return { defaultTab };
}
