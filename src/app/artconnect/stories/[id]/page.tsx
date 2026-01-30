
'use client';

import { use, useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReactionBar } from '@/components/reaction-bar';
import { CommentSection } from '@/components/comment-section';
import { Separator } from '@/components/ui/separator';
import type { StoryPost } from '@/lib/types';
import { doc, Timestamp, deleteDoc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type StoryPageProps = {
  params: Promise<{
    id: string;
  }>
};

function toDate(timestamp: Date | Timestamp | undefined): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp || new Date();
}

function StoryPageSkeleton() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8">
        <Skeleton className="mb-4 h-12 w-3/4" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </header>
      <Skeleton className="relative mb-8 aspect-video w-full rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
      </div>
    </div>
  );
}

export default function StoryPage({ params: paramsProp }: StoryPageProps) {
  const params = use(paramsProp);
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const storyRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'stories', params.id) : null),
    [firestore, params.id]
  );

  const { data: story, isLoading } = useDoc<StoryPost>(storyRef);

  const handleDelete = async () => {
    if (!story || !firestore) return;
    setIsDeleting(true);
    try {
      const docRef = doc(firestore, 'stories', story.id);
      await deleteDoc(docRef)
        .catch(serverError => {
            errorEmitter.emit(
                'permission-error',
                new FirestorePermissionError({
                    path: docRef.path,
                    operation: 'delete',
                })
            );
            throw serverError;
        });

      toast({
        title: 'Story Deleted',
        description: 'The story has been successfully removed.',
      });
      router.push('/');
    } catch (error) {
       if (!(error instanceof FirestorePermissionError)) {
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: 'Could not delete the story. Please try again.',
            });
       }
       setIsDeleting(false);
    }
  };

  if (isLoading || !story) {
    return <StoryPageSkeleton />;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <article>
        <header className="mb-8">
            <div className="flex items-start justify-between">
                <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl min-w-0">
                    {story.title}
                </h1>
                {user && story.authorId === user.uid && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-5 w-5" />
                                <span className="sr-only">Delete Story</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this story
                                and remove its data from our servers.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className='bg-destructive hover:bg-destructive/90'>
                                {isDeleting ? 'Deleting...' : 'Yes, delete it'}
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={story.author.avatarUrl} alt={story.author.name} />
              <AvatarFallback>{story.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{story.author.name}</p>
              <p className="text-sm text-muted-foreground">
                Posted on {format(toDate(story.createdAt), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </header>

        {story.imageUrl && (
          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl shadow-lg">
            <Image
              src={story.imageUrl}
              alt={story.imageHint ?? story.title}
              fill
              className="object-cover"
              data-ai-hint={story.imageHint}
              priority
            />
          </div>
        )}

        <div className="prose prose-lg mx-auto max-w-none dark:prose-invert break-words"
          style={{
            // @ts-ignore
            '--tw-prose-body': 'hsl(var(--foreground) / 0.8)',
            '--tw-prose-headings': 'hsl(var(--foreground))',
            '--tw-prose-lead': 'hsl(var(--foreground))',
            '--tw-prose-links': 'hsl(var(--accent))',
            '--tw-prose-bold': 'hsl(var(--foreground))',
            '--tw-prose-counters': 'hsl(var(--muted-foreground))',
            '--tw-prose-bullets': 'hsl(var(--border))',
          }}
        >
          <p className="text-xl leading-relaxed">{story.content}</p>
        </div>

        <Separator className="my-8" />
        
        <div className="flex justify-center py-4">
          <ReactionBar storyId={story.id} collectionName='stories' />
        </div>

        <Separator className="my-8" />
        
        <CommentSection postId={story.id} collectionName='stories' />

      </article>
    </div>
  );
}
