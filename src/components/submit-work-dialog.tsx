"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Upload, ImagePlus } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import {
  collection,
  serverTimestamp,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import Image from "next/image";
import { Challenge, Submission } from "@/lib/types";
import { generateStoryImage } from "@/ai/artcommunity_flow/generate-story-image-flow";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters.")
    .max(50, "Title is too long."),
  description: z.string().optional(),
  image: z.any().optional(), // Image is optional for validation, we'll check it manually.
});

export function SubmitWorkDialog({
  challenge,
  submissionToEdit,
  children,
}: {
  challenge?: Challenge;
  submissionToEdit?: Submission & { challengeTitle?: string };
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const isEditMode = !!submissionToEdit;
  const challengeId = submissionToEdit?.challengeId || challenge?.id;
  const challengeTitle = submissionToEdit?.challengeTitle || challenge?.title;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isEditMode && submissionToEdit) {
      form.reset({
        title: submissionToEdit.title,
        description: submissionToEdit.description,
        image: undefined, // Correctly reset the file input
      });
      setImagePreview(submissionToEdit.imageUrl);
    }
  }, [isEditMode, submissionToEdit, form]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = (
    dataUrl: string,
    fileType: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL(fileType, 0.85); // 85% quality
        resolve(compressedDataUrl);
      };
      img.src = dataUrl;
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore || !challengeId) return;

    // A file needs to be in the input only if we are in create mode.
    const imageFile = values.image?.[0];
    if (!imagePreview || (!imageFile && !isEditMode)) {
      toast({
        variant: "destructive",
        title: "Image Required",
        description: "Please select an image for your submission.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = submissionToEdit?.imageUrl || "";
      let imageHint = submissionToEdit?.imageHint || "";

      // If a new image was selected, compress and process it
      if (imageFile && imagePreview) {
        const compressed = await compressImage(imagePreview, imageFile.type);
        imageUrl = compressed;

        const hintResult = await generateStoryImage({
          storyContent: `Artwork for challenge: ${challengeTitle}. Submission title: ${values.title}`,
        });
        imageHint = hintResult.imageHint;
      }

      if (isEditMode && submissionToEdit) {
        // Update existing document
        const submissionRef = doc(
          firestore,
          `creativeChallenges/${challengeId}/submissions/${submissionToEdit.id}`
        );
        const updateData = {
          title: values.title,
          description: values.description,
          imageUrl,
          imageHint,
        };
        await updateDoc(submissionRef, updateData).catch((serverError) => {
          errorEmitter.emit(
            "permission-error",
            new FirestorePermissionError({
              path: submissionRef.path,
              operation: "update",
              requestResourceData: updateData,
            })
          );
          throw serverError;
        });

        toast({
          title: "Submission Updated!",
          description: "Your changes have been saved.",
        });
      } else {
        // Create new document
        const authorData = {
          id: user.uid,
          name: user.isAnonymous
            ? "Anonymous Artisan"
            : user.displayName || "Artisan",
          avatarUrl: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
        };

        const submissionData = {
          authorId: user.uid,
          author: authorData,
          challengeId: challengeId,
          challengeTitle: challengeTitle,
          title: values.title,
          description: values.description,
          imageUrl: imageUrl,
          imageHint: imageHint,
          createdAt: serverTimestamp(),
          upvotes: 0,
          downvotes: 0,
          votes: 0,
        };

        const submissionsColRef = collection(
          firestore,
          `creativeChallenges/${challengeId}/submissions`
        );
        await addDoc(submissionsColRef, submissionData).catch((serverError) => {
          errorEmitter.emit(
            "permission-error",
            new FirestorePermissionError({
              path: submissionsColRef.path,
              operation: "create",
              requestResourceData: submissionData,
            })
          );
          throw serverError;
        });

        toast({
          title: "Submission Successful!",
          description: "Your work has been submitted to the challenge.",
        });
      }

      closeDialog();
      router.refresh();
    } catch (error) {
      if (!(error instanceof FirestorePermissionError)) {
        console.error("Failed to submit work:", error);
        toast({
          variant: "destructive",
          title: isEditMode ? "Update Failed" : "Submission Failed",
          description: `Could not ${
            isEditMode ? "update" : "submit"
          } your work. Please try again.`,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const resetForm = () => {
    form.reset({ title: "", description: "" });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeDialog = () => {
    setIsOpen(false);
    // Don't reset form immediately on close in case user wants to reopen
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(resetForm, 300);
    } else if (isEditMode && submissionToEdit) {
      // If we are opening in edit mode, populate the form.
      form.reset({
        title: submissionToEdit.title,
        description: submissionToEdit.description,
      });
      setImagePreview(submissionToEdit.imageUrl);
    } else {
      // If opening in create mode, ensure form is fresh.
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/* ## Updated Dialog Style ## */}
      <DialogContent className="sm:max-w-md bg-white/90 backdrop-blur-lg border-stone-200/80">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-amber-700">
            {isEditMode
              ? "Edit Your Submission"
              : `Submit to: ${challengeTitle}`}
          </DialogTitle>
          <DialogDescription className="text-stone-600">
            {isEditMode
              ? "Update the details of your submission."
              : "Share your creation with the community. Give it a title and upload an image of your work."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-stone-700">Title</FormLabel>
                  <FormControl>
                    {/* ## Updated Input ## */}
                    <Input
                      placeholder="e.g., 'Sunrise Over the Lake'"
                      {...field}
                      className="bg-white/50 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-stone-700">
                    Description (Optional)
                  </FormLabel>
                  <FormControl>
                    {/* ## Updated Textarea ## */}
                    <Textarea
                      placeholder="Tell us a little about your work..."
                      {...field}
                      className="bg-white/50 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-stone-700">Your Artwork</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center gap-4">
                      {/* ## Updated Image Preview ## */}
                      <div className="w-full aspect-video rounded-md border-2 border-dashed border-stone-300/80 flex items-center justify-center bg-stone-50/50 overflow-hidden">
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt="Image preview"
                            width={400}
                            height={225}
                            className="object-contain h-full w-full"
                          />
                        ) : (
                          <div className="text-center text-stone-500 p-4">
                            <ImagePlus className="mx-auto h-12 w-12" />
                            <p>Image Preview</p>
                          </div>
                        )}
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={(e) => {
                          field.onChange(e.target.files);
                          handleImageChange(e);
                        }}
                      />
                      {/* ## Updated Outline Button ## */}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-amber-500 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {imagePreview && !field.value?.[0]
                          ? "Change Image"
                          : "Choose Image"}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              {/* ## Updated Ghost Button ## */}
              <Button
                type="button"
                variant="ghost"
                onClick={closeDialog}
                className="hover:bg-amber-100 text-stone-600 hover:text-amber-700"
              >
                Cancel
              </Button>
              {/* ## Updated CTA Button ## */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:opacity-95 shadow-md hover:shadow-lg transition-all"
              >
                {isSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Submitting..."
                  : isEditMode
                  ? "Save Changes"
                  : "Submit Work"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
