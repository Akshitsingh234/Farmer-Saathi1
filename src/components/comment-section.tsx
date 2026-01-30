"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  collection,
  query,
  orderBy,
  Timestamp,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useUser,
} from "@/firebase";
import type { Comment as CommentType } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const commentSchema = z.object({
  comment: z
    .string()
    .min(1, "Comment cannot be empty.")
    .max(500, "Comment is too long."),
});

type CommentSectionProps = {
  postId: string;
  collectionName: "stories" | "creativeChallenges";
};

export function CommentSection({
  postId,
  collectionName,
}: CommentSectionProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const commentsQuery = useMemoFirebase(
    () =>
      firestore && postId
        ? query(
            collection(firestore, `${collectionName}/${postId}/comments`),
            orderBy("createdAt", "desc")
          )
        : null,
    [firestore, postId, collectionName]
  );

  const { data: comments, isLoading } =
    useCollection<CommentType>(commentsQuery);

  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: "" },
  });

  async function onSubmit(values: z.infer<typeof commentSchema>) {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to post a comment.",
      });
      return;
    }

    try {
      const authorData = {
        id: user.uid,
        name: user.isAnonymous
          ? "Anonymous Artisan"
          : user.displayName || "Artisan",
        avatarUrl: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
      };

      const commentData = {
        content: values.comment,
        createdAt: serverTimestamp(),
        authorId: user.uid,
        author: authorData,
      };

      const commentsColRef = collection(
        firestore,
        `${collectionName}/${postId}/comments`
      );
      await addDoc(commentsColRef, commentData).catch((error) => {
        errorEmitter.emit(
          "permission-error",
          new FirestorePermissionError({
            path: commentsColRef.path,
            operation: "create",
            requestResourceData: commentData,
          })
        );
        throw error;
      });

      form.reset();
      toast({ title: "Success", description: "Your comment has been posted." });
    } catch (error) {
      if (!(error instanceof FirestorePermissionError)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to post comment.",
        });
      }
    }
  }

  const toDate = (timestamp: Date | Timestamp | undefined) => {
    if (!timestamp) return new Date();
    return timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  };

  return (
    <section id="comments" className="space-y-8">
      <h2 className="font-headline text-3xl font-bold text-stone-900">
        Community Discussion
      </h2>
      {/* ## Updated Comment Form Card ## */}
      <div className="rounded-lg border border-stone-200/80 bg-white/70 backdrop-blur-lg p-6 shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  {/* ## Updated Textarea ## */}
                  <Textarea
                    placeholder={
                      user
                        ? "Share your thoughts..."
                        : "Log in to share your thoughts..."
                    }
                    {...field}
                    rows={3}
                    disabled={!user}
                    className="bg-white/50 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* ## Updated CTA Button ## */}
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || !user}
              className="bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:opacity-95 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
            >
              {form.formState.isSubmitting ? "Posting..." : "Post Comment"}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </div>

      <div className="space-y-6">
        {isLoading && (
          <div className="space-y-4">
            {/* ## Updated Skeletons ## */}
            <div className="flex space-x-4">
              <Skeleton className="h-10 w-10 rounded-full bg-stone-200/80" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4 bg-stone-200/80" />
                <Skeleton className="h-4 w-full bg-stone-200/80" />
              </div>
            </div>
            <div className="flex space-x-4">
              <Skeleton className="h-10 w-10 rounded-full bg-stone-200/80" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4 bg-stone-200/80" />
                <Skeleton className="h-4 w-full bg-stone-200/80" />
              </div>
            </div>
          </div>
        )}
        {comments &&
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-4">
              <Avatar>
                <AvatarImage
                  src={comment.author?.avatarUrl}
                  alt={comment.author?.name}
                />
                <AvatarFallback>
                  {comment.author?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              {/* ## Updated Comment Bubble Card ## */}
              <div className="flex-1 rounded-lg border border-stone-200/80 bg-white/70 backdrop-blur-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-stone-800">
                    {comment.author?.name || "Anonymous"}
                  </p>
                  <p className="text-xs text-stone-500">
                    {formatDistanceToNow(toDate(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <p className="mt-2 text-stone-700">{comment.content}</p>
              </div>
            </div>
          ))}
        {!isLoading && comments?.length === 0 && (
          <p className="text-stone-500 text-center">Be the first to comment!</p>
        )}
      </div>
    </section>
  );
}
