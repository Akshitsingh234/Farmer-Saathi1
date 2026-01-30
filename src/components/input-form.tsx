"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";

// ## Increased character limit for prompt and added brand name ##
export const inputSchema = z.object({
  image: z.any().refine((file) => file instanceof File, "Image is required."),
  prompt: z
    .string()
    .min(1, "Prompt is required.")
    .max(500, "Prompt must be 500 characters or less."), // Increased limit
  language: z.string().min(1, "Language is required."),
  brandName: z.string().optional(),
  style: z.string().min(1, "Style is required."),
});

interface InputFormProps {
  onSubmit: (data: z.infer<typeof inputSchema>) => void;
  isLoading: boolean;
  loadingMessage: string;
}

const styleOptions = [
  "Modern",
  "Traditional",
  "Elegant",
  "Minimalist",
  "Vibrant",
  "Earthy",
];

export default function InputForm({
  onSubmit,
  isLoading,
  loadingMessage,
}: InputFormProps) {
  const form = useForm<z.infer<typeof inputSchema>>({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      prompt: "",
      language: "en",
      brandName: "",
      style: "Modern",
    },
  });

  return (
    <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm shadow-lg">
      <CardContent className="p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* ## File Upload Field ## */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body text-stone-700 font-semibold">
                    Product Image
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        field.onChange(e.target.files ? e.target.files[0] : null)
                      }
                      className="file:text-stone-700"
                    />
                  </FormControl>
                  <FormDescription>
                    Upload an image of your product.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ## Prompt Field ## */}
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body text-stone-700 font-semibold">
                    Describe your product
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., A handcrafted ceramic mug, painted with a floral design."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The more details you provide, the better the result.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* ## Brand Name Field ## */}
            <FormField
              control={form.control}
              name="brandName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body text-stone-700 font-semibold">
                    Brand/Company Name (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Artisan Creations" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your brand name will be incorporated into the generated
                    images.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* ## Style Selection ## */}
            <FormField
              control={form.control}
              name="style"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="font-body text-stone-700 font-semibold">
                    Choose a Style
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {styleOptions.map((style) => (
                        <Card
                          key={style}
                          onClick={() => field.onChange(style)}
                          className={`cursor-pointer transition-colors text-center ${
                            field.value === style
                              ? "bg-amber-100 border-amber-500 ring-2 ring-amber-500"
                              : "hover:bg-amber-50 bg-white border"
                          }`}
                        >
                          <div className="p-4">
                            <span className="font-body text-stone-800">
                              {style}
                            </span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* ## Language Selection ## */}
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body text-stone-700 font-semibold">
                    Language for post
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="kn">Kannada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {loadingMessage}
                </>
              ) : (
                "Generate Marketing Assets"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
