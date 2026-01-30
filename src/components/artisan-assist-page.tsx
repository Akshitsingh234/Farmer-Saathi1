'use client';

import { useState, useEffect } from "react";
import type { z } from "zod";
import { generateMultiPlatformText } from "@/ai/posts_flow/generate-multi-platform-text";
import { generateImageSets } from "@/ai/posts_flow/generate-image-sets";
import { useToast } from "@/hooks/use-toast";
import { fileToDataUri } from "@/lib/utils";
import InputForm, { inputSchema } from "./input-form";
import OutputDisplay from "./output-display";
import { GeneratedOutput } from "./types";

const loadingMessages = [
  "Designing your posters...",
  "Writing your story...",
  "Preparing for sharing...",
];

export default function ArtisanAssistPage() {
  const [step, setStep] = useState<"input" | "output">("input");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [output, setOutput] = useState<GeneratedOutput | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (data: z.infer<typeof inputSchema>) => {
    setIsLoading(true);
    setLoadingMessageIndex(0);

    try {
      const imageUri = await fileToDataUri(data.image);

      const [textResult, imageResult] = await Promise.all([
        generateMultiPlatformText({
          productDescription: data.prompt || "A beautiful handcrafted product.",
          languagePreference: data.language,
        }),
        generateImageSets({
          userImage: imageUri,
          theme: data.style,
          optionalPrompt: data.prompt,
          brandName: data.brandName,
        }),
      ]);

      // ## FIX: Correctly structure the designSets array ##
      const designSets = [
        {
          theme: data.style, // The theme for this set
          images: imageResult.images, // The array of image URLs
        },
      ];

      setOutput({ textOutputs: textResult, designSets });
      setStep("output");
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          "There was a problem generating your content. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep("input");
    setOutput(null);
  };

  return (
    // Page inherits the gradient background from the layout
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-8 md:mb-12">
        <h1 className="font-headline text-4xl md:text-6xl font-bold text-amber-700">
          Marketing Studio
        </h1>
        <p className="font-body text-stone-600 text-lg md:text-xl mt-2">
          Create beautiful social media posts in seconds
        </p>
      </header>

      <div className="transition-all duration-500">
        {step === "input" && (
          <div className={isLoading ? "animate-pulse" : ""}>
            <InputForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              loadingMessage={loadingMessages[loadingMessageIndex]}
            />
          </div>
        )}
        {step === "output" && output && (
          <div className="animate-in fade-in-50 duration-700">
            <OutputDisplay data={output} onReset={handleReset} />
          </div>
        )}
      </div>
    </div>
  );
}
