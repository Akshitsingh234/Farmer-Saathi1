"use client";

import { StoryCard } from "@/components/story-card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import type { StoryPost } from "@/lib/types";
import { collection, query, orderBy } from "firebase/firestore";
import { CreateStory } from "@/components/create-story";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card"; // Import Card for the skeleton wrapper
import { useLanguage } from "@/context/language-context";
import Masonry from "react-masonry-css";
import "../masonry.css";

export default function Home() {
  const firestore = useFirestore();
  const { t } = useLanguage();

  const storiesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, "stories"), orderBy("createdAt", "desc"))
        : null,
    [firestore]
  );
  const { data: stories, isLoading } = useCollection<StoryPost>(storiesQuery);
  const breakpointColumnsObj = {
    default: 2,
    700: 1,
  };

  return (
    // Page inherits background, just add padding
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        {/* ## Updated Title Color ## */}
        <h1 className="text-center font-headline text-4xl font-bold tracking-tight md:text-5xl text-stone-900">
          {t("storiesPage.title")}
        </h1>
        <CreateStory />
      </div>

      {isLoading && (
        <div className="grid gap-8">
          {/* ## Updated Skeleton to match card layout ## */}
          <Card className="bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg">
            <Skeleton className="h-[400px] w-full rounded-lg bg-stone-200/80" />
          </Card>
          <Card className="bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg">
            <Skeleton className="h-[400px] w-full rounded-lg bg-stone-200/80" />
          </Card>
        </div>
      )}

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
      
        {stories?.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </Masonry>
    </div>
  );
}
