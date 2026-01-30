'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Reaction } from '@/lib/types';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';

type ReactionBarProps = {
  storyId: string;
  collectionName: 'stories' | 'creativeChallenges';
};

const AVAILABLE_REACTIONS = ['❤️', '✨', '🔥', '👏', '🤔'];

export function ReactionBar({ storyId, collectionName }: ReactionBarProps) {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const reactionsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, `${collectionName}/${storyId}/reactions`) : null),
    [firestore, storyId, collectionName]
  );
  const { data: reactions, isLoading } = useCollection<Reaction>(reactionsQuery);

  const userReaction = useMemo(() => {
    if (!user || !reactions) return null;
    return reactions.find((r) => r.authorId === user.uid);
  }, [user, reactions]);

  const reactionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    if (reactions) {
      for (const reaction of reactions) {
        counts.set(reaction.emoji, (counts.get(reaction.emoji) || 0) + 1);
      }
    }
    return counts;
  }, [reactions]);

  const handleReact = async (emoji: string) => {
    if (!user || !firestore) return;

    const batch = writeBatch(firestore);
    const reactionsCollection = collection(firestore, `${collectionName}/${storyId}/reactions`);

    if (userReaction) {
      const userReactionRef = doc(reactionsCollection, userReaction.id);
      if (userReaction.emoji === emoji) {
        // User is removing their reaction
        batch.delete(userReactionRef);
      } else {
        // User is changing their reaction
        batch.update(userReactionRef, { emoji });
      }
    } else {
      // User is adding a new reaction
      const newReactionRef = doc(reactionsCollection);
      batch.set(newReactionRef, { emoji, authorId: user.uid });
    }

    try {
      await batch.commit();
    } catch (error) {
      console.error('Failed to update reaction', error);
      // Optionally show a toast to the user
    }
  };

  if (isLoading || isUserLoading) {
    return <Skeleton className="h-8 w-48" />;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-1">
        {AVAILABLE_REACTIONS.map((emoji) => {
          const count = reactionCounts.get(emoji) || 0;
          const userHasReactedWithThis = userReaction?.emoji === emoji;
          return (
            <Tooltip key={emoji}>
              <TooltipTrigger asChild>
                <Button
                  variant={userHasReactedWithThis ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3',
                    userHasReactedWithThis && 'border-accent'
                  )}
                  onClick={() => handleReact(emoji)}
                  disabled={!user}
                >
                  <span className="text-lg">{emoji}</span>
                  {count > 0 && (
                    <span className="text-sm font-medium text-muted-foreground">
                      {count}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>React with {emoji}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
