'use client';

import { useState, useTransition, useEffect } from "react";

// TypeScript declaration for model-viewer custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}
import type { EnhancementIdea, TrendingProduct } from "@/lib/types";
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
import {
  Loader2,
  Sparkles,
  ExternalLink,
  TrendingUp,
  RefreshCw,
  Lightbulb,
  Camera,
  Star,
} from "lucide-react";
import {
  getEnhancementIdeasAction,
  getTrendingProductsAction,
} from "@/lib/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useLanguage } from "@/context/language-context";
import { ProductVariationGenerator } from "@/components/product-variation-generator";

export default function InspirationCornerPage() {
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const [isGeneratingIdeas, startGeneratingIdeas] = useTransition();
  const [isFetchingTrends, startFetchingTrends] = useTransition();

  const [productName, setProductName] = useState<string>("Mugs");
  const [enhancementIdeas, setEnhancementIdeas] = useState<EnhancementIdea[]>(
    []
  );
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>(
    []
  );

  const [imageCache, setImageCache] = useState<Record<string, any[]>>({});

  const DEFAULT_LOGO_PATH =
    "/mnt/data/c918caa3-e790-4f7c-b362-649d54f23baf.png";

  const languageLabelMap: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    kn: "Kannada",
  };
  const languageLabel = languageLabelMap[language] || language;

  const fetchImagesForQuery = async (query: string, num = 1) => {
    if (!query) return [];
    if (imageCache[query]) return imageCache[query];

    try {
      const res = await fetch(
        `/api/imageSearch?q=${encodeURIComponent(query)}&num=${num}`
      );
      const data = await res.json();
      const images = data?.imageUrls || [];
      setImageCache((prev) => ({ ...prev, [query]: images }));
      return images;
    } catch (err) {
      console.error("Image fetch error", err);
      return [];
    }
  };

  const handleGetEnhancementIdeas = () => {
    if (!productName) {
      toast({
        variant: "destructive",
        title: t("inspirationCornerPage.errorInputMissing"),
        description: t("inspirationCornerPage.errorInputMissingDesc"),
      });
      return;
    }
    setEnhancementIdeas([]);
    startGeneratingIdeas(async () => {
      const result = await getEnhancementIdeasAction(
        productName,
        "",
        language,
        languageLabel,
        DEFAULT_LOGO_PATH
      );

      if ((result as any).error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: (result as any).error,
        });
        return;
      }
      if ((result as any).ideas) {
        const ideasWithImages = await Promise.all(
          (result.ideas as EnhancementIdea[]).map(async (idea: EnhancementIdea) => {
            const query = `${productName} ${idea.googleSearchQuery || ""}`.trim();
            const imgs = await fetchImagesForQuery(query, 3);
            return { ...idea, imageResults: imgs };
          })
        );
        setEnhancementIdeas(ideasWithImages);
      }
    });
  };

  const handleFetchTrends = () => {
    setTrendingProducts([]);
    startFetchingTrends(async () => {
      const result = await getTrendingProductsAction(language, languageLabel, DEFAULT_LOGO_PATH);
      if ((result as any).error) {
        toast({
          variant: "destructive",
          title: t("inspirationCornerPage.errorFetchingTrends"),
          description: (result as any).error,
        });
        return;
      }
      if ((result as any).products) {
        const productsWithImages = await Promise.all(
          (result.products as TrendingProduct[]).map(async (product: TrendingProduct) => {
            const query = `${product.name} ${product.googleSearchQuery || ""}`.trim();
            const imgs = await fetchImagesForQuery(query, 3);
            return { ...product, imageResults: imgs };
          })
        );
        setTrendingProducts(productsWithImages);
      }
    });
  };

  useEffect(() => {
    handleFetchTrends();
    handleGetEnhancementIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const getPlatformUrl = (platform: string, query: string) => {
    const encodedQuery = encodeURIComponent(query);
    switch (platform.toLowerCase()) {
        case 'etsy':
            return `https://www.etsy.com/in-en/search?q=${encodedQuery}`;
        case 'amazon':
            return `https://www.amazon.in/s?k=${encodedQuery}`;
        case 'flipkart':
            return `https://www.flipkart.com/search?q=${encodedQuery}`;
        case 'meesho':
            return `https://www.meesho.com/search?q=${encodedQuery}`;
        default:
            return `https://www.google.com/search?q=${encodedQuery}`;
    }
}


  return (
    <div className="flex-grow flex flex-col gap-6 p-4 md:p-8">
    <ProductVariationGenerator />
      <Card className="bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg transition-all duration-300 hover:border-amber-300/80">
        <CardHeader>
          <CardTitle className="text-stone-900">{t("inspirationCornerPage.productIdeas")}</CardTitle>
          <CardDescription className="text-stone-600">
            {t("inspirationCornerPage.productIdeasDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-end gap-2">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="product-name" className="text-stone-700">
                {t("inspirationCornerPage.productNameLabel")}
              </Label>
              <Input
                id="product-name"
                placeholder={t("inspirationCornerPage.productNamePlaceholder")}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleGetEnhancementIdeas()
                }
                className="bg-white/50 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <Button
              onClick={handleGetEnhancementIdeas}
              disabled={isGeneratingIdeas}
              className="bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:opacity-95 shadow-md hover:shadow-lg transition-all"
            >
              {isGeneratingIdeas ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {t("inspirationCornerPage.getIdeas")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isGeneratingIdeas && enhancementIdeas.length === 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card
              key={i}
              className="overflow-hidden bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg"
            >
              <Skeleton className="h-48 w-full bg-stone-200/80" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 bg-stone-200/80" />
              </CardHeader>
              <CardContent className="grid gap-2">
                <Skeleton className="h-4 w-full bg-stone-200/80" />
                <Skeleton className="h-4 w-5/6 bg-stone-200/80" />
                <Skeleton className="h-10 w-48 mt-2 bg-stone-200/80" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {enhancementIdeas.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-stone-900 mb-4">
            {t("inspirationCornerPage.enhancementIdeasFor", {productName} )}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enhancementIdeas.map((idea, idx) => (
              <Card
                key={idx}
                className="overflow-hidden flex flex-col bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg transition-all duration-300 hover:border-amber-300/80"
              >
                <div className="w-full p-2 grid grid-cols-3 gap-2 bg-stone-50/50">
                  {idea.imageResults && idea.imageResults.length > 0 ? (
                    idea.imageResults.slice(0, 3).map((img: any, i: number) => (
                      <div
                        key={i}
                        className="relative w-full h-24 bg-stone-100 overflow-hidden rounded"
                      >
                        <Image
                          src={img.link}
                          alt={img.title || idea.title || `image-${i}`}
                          fill
                          style={{ objectFit: "cover" }}
                          unoptimized={true}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 h-24 flex items-center justify-center text-stone-500">
                      <Camera className="w-12 h-12" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-grow p-4">
                  <CardHeader className="p-0 mb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-stone-800">
                      <Lightbulb className="text-amber-600 h-5 w-5" />
                      {idea.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex flex-col gap-4 flex-grow">
                    <p className="text-stone-600 text-sm flex-grow">
                      {idea.description}
                    </p>
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg">
                      <p className="text-sm text-amber-900">
                        <Lightbulb className="w-4 h-4 inline-block mr-2" />
                        {idea.insight}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm text-stone-600">{idea.rating} ({idea.reviewCount} reviews) on {idea.platform}</span>
                        </div>
                        <p className="text-lg font-bold text-amber-600">{idea.suggestedPrice}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap mt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="w-fit border-amber-500 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                        >
                            <a
                            href={getPlatformUrl(idea.platform, idea.platformSearchQuery)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5"
                            >
                            <ExternalLink className="h-3.5 w-3.5" />
                            View on {idea.platform}
                            </a>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="w-fit border-blue-500 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                        >
                            <a
                            href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(idea.googleSearchQuery)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5"
                            >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Google
                            </a>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="w-fit border-red-500 text-red-600 hover:bg-red-100 hover:text-red-700"
                        >
                            <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(idea.googleSearchQuery + " tutorial")} `}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5"
                            >
                            <ExternalLink className="h-3.5 w-3.5" />
                            YouTube
                            </a>
                        </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card className="bg-white/70 backdrop-blur-lg border">
        <CardHeader>
          <CardTitle>{t("inspirationCornerPage.arVisualization")}</CardTitle>
          <CardDescription>
            {t("inspirationCornerPage.arVisualizationDesc")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <model-viewer
            src="/models/mug.glb"
            alt="3D Mug Model"
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            shadow-intensity="1"
            style={{ width: "100%", height: "400px" }}
          >
          </model-viewer>
        </CardContent>
      </Card>

      <Card className="flex flex-col flex-grow bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg transition-all duration-300 hover:border-amber-300/80">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-900">
              <TrendingUp className="text-amber-600" /> {t("inspirationCornerPage.trendingArtisanProducts")}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFetchTrends}
              disabled={isFetchingTrends}
              className="hover:bg-amber-100 text-stone-600 hover:text-amber-700"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetchingTrends ? "animate-spin" : ""}`}
              />
            </Button>
          </CardTitle>
          <CardDescription className="text-stone-600">
            {t("inspirationCornerPage.trendingArtisanProductsDesc")}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow flex flex-col">
          <ScrollArea className="flex-grow h-[500px]">
            <div className="pr-4">
              {isFetchingTrends && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-[200px] w-full rounded-lg bg-stone-200/80" />
                      <Skeleton className="h-5 w-2/3 bg-stone-200/80" />
                      <Skeleton className="h-4 w-full bg-stone-200/80" />
                    </div>
                  ))}
                </div>
              )}

              {!isFetchingTrends && trendingProducts.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trendingProducts.map((product, i) => (
                    <Card
                      key={i}
                      className="flex flex-col overflow-hidden bg-white/50 border-stone-200/80 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="w-full p-2 grid grid-cols-3 gap-2 bg-stone-50/50">
                        {product.imageResults &&
                        product.imageResults.length > 0 ? (
                          product.imageResults
                            .slice(0, 3)
                            .map((img: any, j: number) => (
                              <div
                                key={j}
                                className="relative w-full h-24 bg-stone-100 overflow-hidden rounded"
                              >
                                <Image
                                  src={img.link}
                                  alt={img.title || product.name}
                                  fill
                                  style={{ objectFit: "cover" }}
                                  unoptimized
                                />
                              </div>
                            ))
                        ) : (
                          <div className="col-span-3 h-24 flex items-center justify-center text-stone-500">
                            <Camera className="w-12 h-12" />
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex-grow">
                        <h4 className="font-semibold text-base mb-1 text-stone-800">
                          {product.name}
                        </h4>
                        <p className="text-sm text-stone-600">
                          {product.description}
                        </p>
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg mt-2">
                          <p className="text-sm text-amber-900">
                            <Lightbulb className="w-4 h-4 inline-block mr-2" />
                            {product.insight}
                          </p>
                        </div>
                         <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                <span className="text-sm text-stone-600">{product.rating} ({product.reviewCount} reviews) on {product.platform}</span>
                            </div>
                            <p className="text-lg font-bold text-amber-600">{product.suggestedPrice}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap mt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="w-fit border-amber-500 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                            >
                                <a
                                href={getPlatformUrl(product.platform, product.platformSearchQuery)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5"
                                >
                                <ExternalLink className="h-3.5 w-3.5" />
                                View on {product.platform}
                                </a>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="w-fit border-blue-500 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                            >
                                <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(product.googleSearchQuery)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5"
                                >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Google
                                </a>
                            </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {!isFetchingTrends && trendingProducts.length === 0 && (
                <div className="text-center h-40 flex flex-col justify-center items-center">
                  <p className="text-stone-500">
                    {t("inspirationCornerPage.refreshTrends")}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
