"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Palette, Wand2, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateImageVariationAction } from "@/lib/actions/generate-image-variation";

// ---------- config ----------
const DEMO_LOCAL_PATH = "/mnt/data/411a9c07-1e28-4d8b-8841-a0dd17c86d41.png";

const colors = ["Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Black", "White"];
const styles = ["traditional", "modern", "simplistic"];

// Inline SVG fallback (data url)
function svgPlaceholder(text = "Image unavailable", w = 600, h = 400) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'><rect width='100%' height='100%' fill='#f0f0f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='20' fill='#333'>${text}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ---------- Component ----------
export function ProductVariationGenerator() {
  const { toast } = useToast();
  const [isGenerating, startGenerating] = useTransition();

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [customColor, setCustomColor] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<"traditional" | "modern" | "simplistic">("traditional");
  const [generatedVariations, setGeneratedVariations] = useState<string[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setGeneratedVariations([]);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const handleGenerateVariations = () => {
    if (!uploadedImage) return;
    
    startGenerating(async () => {
      const result = await generateImageVariationAction(
        uploadedImage,
        selectedColor === "Other" ? customColor : selectedColor,
        selectedStyle
      );
  
      if (result && 'images' in result) {
        setGeneratedVariations(result.images);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to generate",
          description: (result && 'error' in result) ? result.error : "Unknown error",
        });
      }
    });
  };
  
  
  

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const t = e.currentTarget;
    if (!t.dataset.fallback) {
      t.dataset.fallback = "1";
      t.src = svgPlaceholder(`${t.alt || "Image"} failed to load`, 600, 400);
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-md border border-stone-200/80 shadow-lg">
      <CardHeader>
        <CardTitle>Product Variation Generator</CardTitle>
        <CardDescription>
          Create variations of your product with AI-driven color & style changes.
        </CardDescription>
      </CardHeader>
  
      <CardContent className="space-y-10">

  {/* ---- TOP SECTION ---- */}
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">

    {/* LEFT: UPLOAD + PREVIEW */}
    <div className="space-y-5">

      {/* Upload label */}
      <div className="space-y-2">
        <Label className="text-stone-700 text-sm font-medium">Upload Product Image</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="h-11 bg-white border-stone-300 rounded-xl shadow-sm hover:border-stone-400 transition"
        />
      </div>

      {/* Image Preview */}
      {uploadedImage ? (
        <div className="w-full h-64 bg-stone-100 rounded-2xl shadow-inner flex items-center justify-center overflow-hidden">
          <img
            src={uploadedImage}
            alt="Uploaded Product"
            className="object-contain w-full h-full"
            onError={handleImgError}
          />
        </div>
      ) : (
<div className="w-full h-64 bg-stone-100 rounded-2xl shadow-inner flex items-center justify-center overflow-hidden">
<svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 16V8a2 2 0 0 1 2-2h8m0 0l8 8m-8-8v6a2 2 0 0 0 2 2h6" />
          </svg>
          <p className="text-sm">Upload an image to begin</p>
        </div>
      )}
    </div>

    {/* RIGHT: CONTROLS */}
    <div className="space-y-8">

      {/* Color Selection */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-stone-700 font-medium">
          <Palette className="w-4 h-4" />
          Choose Color
        </Label>

        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <Button
              key={color}
              size="sm"
              variant={selectedColor === color ? "default" : "outline"}
              className="rounded-full px-5"
              onClick={() => {
                setSelectedColor(color);
                setCustomColor("");
              }}
            >
              {color}
            </Button>
          ))}

          <Button
            size="sm"
            variant={selectedColor === "Other" ? "default" : "outline"}
            className="rounded-full px-5"
            onClick={() => setSelectedColor("Other")}
          >
            Other
          </Button>
        </div>

        {selectedColor === "Other" && (
          <Input
            placeholder="Enter custom color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="h-10 bg-white border-stone-300 rounded-xl shadow-sm"
          />
        )}
      </div>

      {/* Style Selection */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-stone-700 font-medium">
          <Wand2 className="w-4 h-4" />
          Style
        </Label>
        <Select
          value={selectedStyle}
          onValueChange={(v) => setSelectedStyle(v as any)}
        >
          <SelectTrigger className="h-11 bg-white border-stone-300 rounded-xl shadow-sm">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            {styles.map((style) => (
              <SelectItem key={style} value={style}>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerateVariations}
        disabled={isGenerating || !uploadedImage}
        className="w-full h-12 rounded-xl bg-green-700 hover:bg-green-800 text-white text-md shadow-md"
      >
        {isGenerating ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-5 w-5" />
        )}
        Generate with AI
      </Button>

    </div>
  </div>

  {/* ---- GENERATED VARIATIONS ---- */}
  {generatedVariations.length > 0 && (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-stone-800">Generated Variations</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {generatedVariations.map((src, idx) => (
          <div
            key={idx}
            className="w-full aspect-square bg-stone-100 rounded-xl shadow-inner flex items-center justify-center overflow-hidden"
          >
            <img
              src={src}
              alt={`Variation ${idx + 1}`}
              className="object-contain w-full h-full"
              onError={handleImgError}
            />
          </div>
        ))}
      </div>
    </div>
  )}
</CardContent>

    </Card>
  );
  
  
}