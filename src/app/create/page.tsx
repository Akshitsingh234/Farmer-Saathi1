"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/language-context"; // ✅ use hook
import { PlusCircle, Wand2, Upload } from "lucide-react";
import Image from "next/image";
import { generateTags } from "@/ai/community_flow/generate-tags";
import { useArtworks } from "@/context/artwork-context";
import type { Artwork } from "@/lib/data";

const artworkFormSchema = z
  .object({
    title: z
      .string()
      .min(2, { message: "Title must be at least 2 characters." }),
    type: z.enum(["image", "video", "text"]),
    tags: z.string().min(1, { message: "Please add at least one tag." }),
    mediaDataUri: z.string().optional(),
    content: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "image" || data.type === "video")
        return !!data.mediaDataUri;
      if (data.type === "text")
        return !!data.content && data.content.length >= 10;
      return false;
    },
    {
      message: "Please provide the required content for the selected type.",
      path: ["mediaDataUri"],
    }
  );

type ArtworkFormValues = z.infer<typeof artworkFormSchema>;

export default function CreatePage() {
  const { t, language, setLanguage } = useLanguage(); // ✅ translation + state
  const { addArtwork } = useArtworks();
  const { toast } = useToast();
  const router = useRouter();

  const [artworkType, setArtworkType] = useState<string>("image");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);

  const form = useForm<ArtworkFormValues>({
    resolver: zodResolver(artworkFormSchema),
    defaultValues: {
      title: "",
      type: "image",
      tags: "",
      mediaDataUri: "",
      content: "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setMediaPreview(dataUri);
        form.setValue("mediaDataUri", dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSuggestTags = async () => {
    const title = form.getValues("title");
    const mediaDataUri = form.getValues("mediaDataUri");

    if (!mediaDataUri || !title) {
      toast({
        variant: "destructive",
        title: t("create.missingInfoTitle"),
        description: t("create.missingInfoDescription"),
      });
      return;
    }

    setIsSuggestingTags(true);
    toast({ title: t("create.suggestingTags") });

    try {
      const { tags } = await generateTags({
        photoDataUri: mediaDataUri,
        title,
      });
      if (tags && tags.length > 0) {
        form.setValue("tags", tags.join(", "));
        toast({
          title: t("create.tagsSuggestedTitle"),
          description: t("create.tagsSuggestedDescription"),
        });
      } else {
        throw new Error("No tags were generated.");
      }
    } catch (error) {
      console.error("Tag generation error:", error);
      toast({
        variant: "destructive",
        title: t("create.tagGenerationFailedTitle"),
        description: t("create.tagGenerationFailedDescription"),
      });
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const onSubmit = (data: ArtworkFormValues) => {
    const newArtwork: Artwork = {
      id: Date.now(),
      title: data.title,
      type: data.type as "image" | "video" | "text",
      artist: "You",
      tags: data.tags.split(",").map((tag) => tag.trim()),
      likes: 0,
      commentsCount: 0,
      isUserSubmission: true,
      content: data.content,
    };

    if (data.type === "image" && data.mediaDataUri) {
      newArtwork.imageUrl = data.mediaDataUri;
    } else if (data.type === "video" && data.mediaDataUri) {
      newArtwork.videoUrl = data.mediaDataUri;
    }

    addArtwork(newArtwork);

    toast({
      title: t("create.submitSuccessTitle"),
      description: t("create.submitSuccessDescription"),
    });
    router.push("/");
  };

  return (
    <div className="container py-12 max-w-2xl">
      {/* ✅ Language Switcher */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setLanguage(language === "en" ? "hi" : "en")}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          {language === "en" ? "हिन्दी" : "English"}
        </button>
      </div>

      <div className="flex flex-col items-center mb-8 text-center">
        <PlusCircle className="h-16 w-16 mb-4 text-primary" />
        <h1 className="text-4xl font-headline font-bold">
          {t("create.pageTitle")}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("create.pageDescription")}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("create.titleLabel")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("create.titlePlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("create.typeLabel")}</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setArtworkType(value);
                    setMediaPreview(null);
                    form.resetField("mediaDataUri");
                    form.resetField("content");
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("create.typeSelectPlaceholder")}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="image">
                      {t("create.typeImage")}
                    </SelectItem>
                    <SelectItem value="video">
                      {t("create.typeVideo")}
                    </SelectItem>
                    <SelectItem value="text">{t("create.typeText")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {(artworkType === "image" || artworkType === "video") && (
            <FormField
              control={form.control}
              name="mediaDataUri"
              render={() => (
                <FormItem>
                  <FormLabel>{t("create.mediaUploadLabel")}</FormLabel>
                  <FormControl>
                    <div className="relative w-full border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 text-center hover:border-primary transition-colors">
                      <Input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept={artworkType === "image" ? "image/*" : "video/*"}
                        onChange={handleFileChange}
                      />
                      {mediaPreview ? (
                        artworkType === "image" ? (
                          <Image
                            src={mediaPreview}
                            alt="Image preview"
                            width={400}
                            height={300}
                            className="w-auto h-auto max-h-64 mx-auto rounded-md"
                          />
                        ) : (
                          <video
                            src={mediaPreview}
                            controls
                            className="max-h-64 mx-auto rounded-md"
                          />
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                          <Upload className="h-10 w-10" />
                          <p>{t("create.mediaDropzone")}</p>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("create.contentLabel")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("create.contentPlaceholder")}
                    className="resize-y min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("create.tagsLabel")}</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      placeholder={t("create.tagsPlaceholder")}
                      {...field}
                      className="flex-grow"
                    />
                  </FormControl>
                  {artworkType === "image" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSuggestTags}
                      disabled={
                        isSuggestingTags ||
                        !form.getValues("mediaDataUri") ||
                        !form.getValues("title")
                      }
                    >
                      <Wand2 className="mr-2 h-4 w-4" />
                      {t("create.suggestTagsButton")}
                    </Button>
                  )}
                </div>
                <FormDescription>{t("create.tagsDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" size="lg">
            {t("create.submitButton")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
