
'use client';

import { useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Submission, Vote } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, writeBatch, runTransaction } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type VoteControlProps = {
  submission: Submission;
};

export function VoteControl({ submission }: VoteControlProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);

  const voteRef = useMemoFirebase(
    () =>
      user && firestore
        ? doc(
            firestore,
            `creativeChallenges/${submission.challengeId}/submissions/${submission.id}/votes/${user.uid}`
          )
        : null,
    [firestore, user, submission]
  );

  const { data: userVote } = useDoc<Vote>(voteRef);

  const handleVote = async (newVote: 'up' | 'down') => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Not logged in',
        description: 'You must be logged in to vote.',
      });
      return;
    }
    if (isVoting) return;
    setIsVoting(true);

    const submissionRef = doc(firestore, `creativeChallenges/${submission.challengeId}/submissions/${submission.id}`);
    const currentUserVoteRef = doc(firestore, `creativeChallenges/${submission.challengeId}/submissions/${submission.id}/votes/${user.uid}`);

    try {
      await runTransaction(firestore, async (transaction) => {
        const submissionDoc = await transaction.get(submissionRef);
        if (!submissionDoc.exists()) {
          throw new Error("Submission does not exist!");
        }

        const userVoteDoc = await transaction.get(currentUserVoteRef);
        const existingVote = userVoteDoc.exists() ? (userVoteDoc.data() as Vote).vote : null;

        let upvoteIncrement = 0;
        let downvoteIncrement = 0;
        let voteData: Vote | null = null;


        if (existingVote === newVote) {
          // User is undoing their vote
          transaction.delete(currentUserVoteRef);
          if (newVote === 'up') upvoteIncrement = -1;
          else downvoteIncrement = -1;
        } else if (existingVote) {
          // User is changing their vote
          voteData = { 
            id: user.uid,
            userId: user.uid,
            submissionId: submission.id,
            challengeId: submission.challengeId,
            vote: newVote
           };
          transaction.update(currentUserVoteRef, { vote: newVote });
          if (newVote === 'up') {
            upvoteIncrement = 1;
            downvoteIncrement = -1;
          } else {
            upvoteIncrement = -1;
            downvoteIncrement = 1;
          }
        } else {
          // User is casting a new vote
          voteData = { 
            id: user.uid,
            userId: user.uid,
            submissionId: submission.id,
            challengeId: submission.challengeId,
            vote: newVote
           };
          transaction.set(currentUserVoteRef, voteData);
          if (newVote === 'up') upvoteIncrement = 1;
          else downvoteIncrement = 1;
        }

        const newUpvotes = submissionDoc.data().upvotes + upvoteIncrement;
        const newDownvotes = submissionDoc.data().downvotes + downvoteIncrement;
        
        const submissionUpdateData = {
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          votes: newUpvotes - newDownvotes,
        };
        transaction.update(submissionRef, submissionUpdateData);
      }).catch(serverError => {
        // This catch block is specifically for capturing errors from the transaction promise itself,
        // which often include permission denied errors.
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: submissionRef.path, // We can approximate the failing path
            operation: 'update',      // Transactions are complex, but 'update' is a safe guess
        }));
        // We still throw to allow the outer catch to handle UI feedback if necessary.
        throw serverError;
      });

    } catch (error: any) {
      // This will catch the re-thrown error from the transaction's catch block.
      // We check if it's NOT a permission error because those are handled globally.
      if (!(error instanceof FirestorePermissionError)) {
          console.error("Vote transaction failed: ", error);
          toast({
              variant: "destructive",
              title: "Something went wrong",
              description: "Your vote could not be cast. Please try again.",
          });
      }
    } finally {
      setIsVoting(false);
    }
  };

  const voteCount = submission.votes;
  const userUpvoted = userVote?.vote === 'up';
  const userDownvoted = userVote?.vote === 'down';

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleVote('up')}
        disabled={!user || isVoting}
        className={cn('h-8 w-8 rounded-full', userUpvoted && 'bg-green-100 text-green-600 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-400 dark:hover:bg-green-900/50')}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <span className={cn(
        "min-w-[2rem] text-center font-bold",
        voteCount > 0 && "text-green-600 dark:text-green-400",
        voteCount < 0 && "text-red-600 dark:text-red-400",
      )}>
        {voteCount}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleVote('down')}
        disabled={!user || isVoting}
        className={cn('h-8 w-8 rounded-full', userDownvoted && 'bg-red-100 text-red-600 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900/50')}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
    </div>
  );
}
