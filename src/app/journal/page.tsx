"use client";

import { ArtworkCard } from "@/components/artwork-card";
import { PenSquare } from "lucide-react";
import { useArtworks } from "@/context/artwork-context";
import { useLanguage } from "@/context/language-context";

export default function JournalPage() {
  const { artworks } = useArtworks();
  const { t, language, setLanguage } = useLanguage();

  const textArtworks = artworks.filter((artwork) => artwork.type === "text");

  // ✅ Demo journal entries
  const demoTextArtworks = [
    {
      id: 2001,
      title: "Seeds of Hope",
      description:
        "Every seed I plant feels like a promise to tomorrow. The soil remembers our touch, and the rains bring blessings.",
      tags: ["journal"],
      artist: "Ananya Singh",
      type: "text",
      likes: 8,
      commentsCount: 2,
      isUserSubmission: false,
    },
    {
      id: 2002,
      title: "Morning in the Fields",
      description:
        "The mist rises slowly over the fields. Dew on the crops feels like pearls gifted by nature.",
      tags: ["journal"],
      artist: "Rajesh Kumar",
      type: "text",
      likes: 12,
      commentsCount: 4,
      isUserSubmission: false,
    },
    {
      id: 2003,
      title: "A Farmer’s Dream",
      description:
        "One day, technology and tradition will walk hand in hand, helping farmers prosper without losing our roots.",
      tags: ["journal"],
      artist: "Meera Iyer",
      type: "text",
      likes: 15,
      commentsCount: 6,
      isUserSubmission: false,
    },
  ];

  // ✅ Use real text artworks if present, otherwise fall back to demo
  const displayTextArtworks =
    textArtworks.length > 0 ? textArtworks : demoTextArtworks;

  return (
    <div className="container py-8">
      {/* Language Switcher */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setLanguage(language === "en" ? "hi" : "en")}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          {language === "en" ? "हिन्दी" : "English"}
        </button>
      </div>

      {/* Page header */}
      <div className="flex flex-col items-center mb-12 text-center">
        <PenSquare className="h-16 w-16 mb-4 text-primary" />
        <h1 className="text-4xl font-headline font-bold">
          {t("journal.pageTitle")}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          {t("journal.pageDescription")}
        </p>
      </div>

      {/* Entries */}
      {displayTextArtworks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-5 duration-500 max-w-5xl mx-auto">
          {displayTextArtworks.map((artwork) => (
            <div key={artwork.id} className="flex flex-col">
              <ArtworkCard artwork={artwork} />
              
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-2xl font-headline">{t("journal.noEntries")}</h2>
          <p className="text-muted-foreground mt-2">
            {t("journal.noEntriesDescription")}
          </p>
        </div>
      )}
    </div>
  );
}
