'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Users } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

function SubmissionCounter({ challengeId }: { challengeId: string }) {
  const firestore = useFirestore();
  const submissionsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, `creativeChallenges/${challengeId}/submissions`))
        : null,
    [firestore, challengeId]
  );
  const { data: submissions, isLoading } = useCollection(submissionsQuery);

  if (isLoading) {
    return <Skeleton className="h-5 w-24" />
  }

  const count = submissions?.length ?? 0;

  return (
    <div
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <Users className="h-5 w-5" />
      <span>{count} {count === 1 ? 'Submission' : 'Submissions'}</span>
    </div>
  );
}

export { SubmissionCounter };
