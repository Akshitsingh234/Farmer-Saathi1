"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { StoryPost } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ReactionBar } from "./reaction-bar";
import { MessageSquare } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, Timestamp } from "firebase/firestore";
import Image from "next/image";

type StoryCardProps = {
  story: StoryPost;
};

function toDate(timestamp: Date | Timestamp | undefined): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp || new Date();
}

function CommentCounter({ storyId }: { storyId: string }) {
  const firestore = useFirestore();
  const commentsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, `stories/${storyId}/comments`))
        : null,
    [firestore, storyId]
  );
  const { data: comments } = useCollection(commentsQuery);

  return (
    <Link
      href={`/artconnect/stories/${storyId}`}
      // ## Updated Comment Link Style ##
      className="flex items-center gap-2 text-sm text-stone-500 transition-colors hover:text-amber-600"
    >
      <MessageSquare className="h-5 w-5" />
      <span>{comments?.length ?? 0} Comments</span>
    </Link>
  );
}

export function StoryCard({ story }: StoryCardProps) {
  const timeAgo = formatDistanceToNow(toDate(story.createdAt), {
    addSuffix: true,
  });

  return (
    // ## Updated Card Style ##
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg group mb-8">
      {story.imageUrl && (
        <Link href={`/artconnect/stories/${story.id}`} className="block">
          <div className="aspect-video w-full overflow-hidden">
            <Image
              src={story.imageUrl}
              alt={story.imageHint ?? story.title}
              width={512}
              height={288}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
      )}
      <Link href={`/artconnect/stories/${story.id}`} className="block">
        <CardHeader className="flex flex-row items-center space-x-4">
          <Avatar>
            <AvatarImage src={story.author.avatarUrl} alt={story.author.name} />
            <AvatarFallback>{story.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            {/* ## Updated Author Text ## */}
            <p className="font-semibold text-stone-800">{story.author.name}</p>
            <p className="text-sm text-stone-500">{timeAgo}</p>
          </div>
        </CardHeader>
        <CardContent>
          {/* ## Updated Story Text ## */}
          <h2 className="mb-4 font-headline text-3xl font-bold text-stone-900">
            {story.title}
          </h2>
          <p className="line-clamp-3 text-lg leading-relaxed text-stone-700">
            {story.content}
          </p>
        </CardContent>
      </Link>
      {/* ## Updated Card Footer ## */}
      <CardFooter className="flex items-center justify-between bg-stone-50/50 p-4">
        <ReactionBar storyId={story.id} collectionName="stories" />
        <CommentCounter storyId={story.id} />
      </CardFooter>
    </Card>
  );
}
