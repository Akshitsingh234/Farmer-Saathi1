'use client';

import { useState, useTransition, useEffect } from "react";
import type { Place } from "@/lib/types";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MapPin, Search, Store, BadgeIndianRupee, ExternalLink } from "lucide-react";
import { getPriceSuggestionAction, findPlacesAction } from "@/lib/actions";
import { getMaterialPricesAction } from "@/lib/actions/get-material-prices";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/context/language-context";
import { Skeleton } from "@/components/ui/skeleton";


// Default values
const defaultProductToSell = "handmade ceramic mugs";
const defaultMaterialToBuy = "pottery clay";

// Logo note
const DEFAULT_LOGO_PATH = "/mnt/data/c918caa3-e790-4f7c-b362-649d54f23baf.png";

// -----------------------------------------
// 🚀 Demo JSON data to show immediately
// -----------------------------------------
const DEMO_PLACES: Place[] = [
  {
    name: "Good Earth",
    address:
      "C-88, Prithviraj Rd, C Scheme, Ashok Nagar, Jaipur, Rajasthan 302001",
  },
  {
    name: "Anokhi Cafe & Store",
    address:
      "C-11, 2nd Floor, KK Square, Prithviraj Rd, C Scheme, Ashok Nagar, Jaipur, Rajasthan 302001",
  },
  {
    name: "Fabindia",
    address: "8, Sardar Patel Rd, Civil Lines, Jaipur, Rajasthan 302001",
  },
  {
    name: "Hot Pink",
    address:
      "170, Civil Lines, Behind Rajmahal Palace, Jaipur, Rajasthan 302006",
  },
  {
    name: "Neerja International Inc.",
    address:
      "B-2, Prithviraj Rd, C Scheme, Ashok Nagar, Jaipur, Rajasthan 302001",
  },
  {
    name: "Rajasthan Handicrafts Emporium",
    address: "C-2, Ashok Marg, C Scheme, Ashok Nagar, Jaipur, Rajasthan 302001",
  },
  {
    name: "Kripal Kumbh",
    address: "P-1, Bhawani Singh Rd, Rambagh, Jaipur, Rajasthan 302015",
  },
];


// ----------------------------------------------------

export default function SourcingPricingPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [isFindingPlaces, startFindingPlaces] = useTransition();
  const [isSuggestingPrice, startSuggestingPrice] = useTransition();
  const [isFetchingPrices, startFetchingPrices] = useTransition();

  const [sourcingMode, setSourcingMode] = useState<"sell" | "buy">("sell");
  const [city, setCity] = useState<string>("Jaipur");
  const [productToSell, setProductToSell] =
    useState<string>(defaultProductToSell);
  const [materialToBuy, setMaterialToBuy] =
    useState<string>(defaultMaterialToBuy);
  const [currency, setCurrency] = useState<string>("INR");

  const [places, setPlaces] = useState<Place[]>(DEMO_PLACES);
  const [priceSuggestion, setPriceSuggestion] = useState<any>(null);
  const [materialPrices, setMaterialPrices] = useState<any[]>([]);


  const [searchPerformed, setSearchPerformed] = useState(false);

  const languageLabelMap: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    kn: "Kannada",
  };
  const languageLabel = languageLabelMap[language] || language;

  // -----------------------------------------
  // 🚀 Handle Find (fresh fetch every time)
  // -----------------------------------------
  const handleFindPlaces = async () => {
    const query = sourcingMode === "sell" ? productToSell : materialToBuy;

    if (!query || !city) {
      toast({
        variant: "destructive",
        title: t("sourcingPricingPage.errorInputMissing"),
        description: t("sourcingPricingPage.errorInputMissingDesc"),
      });
      return;
    }

    setSearchPerformed(true);

    // Clear table + price before search
    setPlaces([]);
    setPriceSuggestion(null);
    setMaterialPrices([]);

    // --- Fetch Material Prices (if in buy mode) ---
    if (sourcingMode === 'buy') {
      startFetchingPrices(async () => {
          const priceResult = await getMaterialPricesAction(materialToBuy, currency);
          if ((priceResult as any).error) {
              console.error("Error fetching material prices:", (priceResult as any).error);
              setMaterialPrices([]);
          } else if ((priceResult as any).prices) {
              setMaterialPrices((priceResult as any).prices);
          }
      });
    }

    startFindingPlaces(async () => {
      // If selling → get price suggestion
      if (sourcingMode === "sell") {
        startSuggestingPrice(async () => {
          const priceResult = await getPriceSuggestionAction({
            product: productToSell,
            currency,
            language,
            languageLabel,
            logoUrl: DEFAULT_LOGO_PATH,
          });

          if ((priceResult as any).error) {
            toast({
              variant: "destructive",
              title: t("sourcingPricingPage.errorPricing"),
              description: (priceResult as any).error,
            });
          } else if ((priceResult as any).suggestion) {
            setPriceSuggestion((priceResult as any).suggestion);
          }
        });
      }

      const placesResult = await findPlacesAction({
        query,
        city,
        mode: sourcingMode,
        language,
        languageLabel,
        logoUrl: DEFAULT_LOGO_PATH,
      });

      if ((placesResult as any).error) {
        toast({
          variant: "destructive",
          title: t("sourcingPricingPage.errorFindingPlaces"),
          description: (placesResult as any).error,
        });
      } else if ((placesResult as any).places) {
        setPlaces((placesResult as any).places);
      }
    });
  };

  // -----------------------------------------
  // Empty/Loading Table UI
  // -----------------------------------------
  const TablePlaceholder = () => (
    <TableRow>
      <TableCell colSpan={3} className="h-64">
        <div className="flex flex-col items-center justify-center h-full gap-2 text-stone-500">
          {isFindingPlaces ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
              <p className="font-medium text-stone-600 mt-2">
                {t("sourcingPricingPage.searchingPlaces", { city })}
              </p>
            </>
          ) : (
            <>
              <Store className="h-12 w-12" />
              <p className="font-medium mt-2">
                {t("sourcingPricingPage.noShopsFound")}
              </p>
              <p className="text-sm text-stone-500">
                {t("sourcingPricingPage.tryDifferentSearch")}
              </p>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  const eCommerceSites = [
    { name: 'Amazon', url: `https://www.amazon.in/s?k=${encodeURIComponent(materialToBuy)}` },
    { name: 'Flipkart', url: `https://www.flipkart.com/search?q=${encodeURIComponent(materialToBuy)}` },
    { name: 'Indiamart', url: `https://dir.indiamart.com/search.mp?ss=${encodeURIComponent(materialToBuy)}` },
  ];

  return (
    <div className="flex-grow p-4 md:p-8 bg-gradient-to-b from-[#FBF9F6] to-amber-50">
      <Card className="flex-grow flex flex-col bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg">
        <CardHeader>
          <CardTitle className="text-stone-900">
            {t("sourcingPricingPage.title")}
          </CardTitle>
          <CardDescription className="text-stone-600">
            {t("sourcingPricingPage.description")}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 flex-grow">
          {/* Controls */}
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="grid gap-1.5">
                <Label className="text-stone-700">
                  {t("sourcingPricingPage.iWantTo")}
                </Label>

                <RadioGroup
                  defaultValue="buy"
                  value={sourcingMode}
                  onValueChange={(value) =>
                    setSourcingMode(value as "sell" | "buy")
                  }
                  className="flex items-center"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sell" id="r1" />
                    <Label htmlFor="r1">
                      {t("sourcingPricingPage.sellProducts")}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="buy" id="r2" />
                    <Label htmlFor="r2">
                      {t("sourcingPricingPage.buyMaterials")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid w-full max-w-xs gap-1.5">
                <Label>{t("sourcingPricingPage.inCity")}</Label>
                <Input
                  placeholder="e.g. Jaipur"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            {/* Product/Material */}
          <div className="flex flex-wrap items-end gap-3">
              {sourcingMode === "sell" ? (
                <>
                  <div className="grid w-full flex-1 gap-1.5">
                    <Label>{t("sourcingPricingPage.productToSell")}</Label>
                    <Input
                      value={productToSell}
                      onChange={(e) => setProductToSell(e.target.value)}
                    />
                  </div>

                  <div className="grid items-center gap-1.5">
                    <Label>{t("sourcingPricingPage.currency")}</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="grid w-full flex-1 gap-1.5">
                  <Label>{t("sourcingPricingPage.rawMaterialToBuy")}</Label>
                  <Input
                    value={materialToBuy}
                    onChange={(e) => setMaterialToBuy(e.target.value)}
                  />
                </div>
              )}

              <Button
                onClick={handleFindPlaces}
                className="bg-gradient-to-r from-amber-500 to-rose-600 text-white"
              >
                {isFindingPlaces || isFetchingPrices ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                {t("sourcingPricingPage.find")}
              </Button>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Price Suggestion */}
          {priceSuggestion && sourcingMode === "sell" && (
            <Card className="bg-amber-50 border border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-700">
                  {t("sourcingPricingPage.suggestedSellingPrice")}
                </CardTitle>
                <CardDescription className="text-amber-900/80">
                  {priceSuggestion.justification}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-800 flex items-center">
                  <BadgeIndianRupee className="mr-1" />{" "}
                  {priceSuggestion.priceRange}
                </p>
              </CardContent>
            </Card>
          )}

          {/* E-commerce links for "Buy" mode */}
          {sourcingMode === 'buy' && searchPerformed && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-stone-800 mb-3">
                Buy Raw Materials Online
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eCommerceSites.map((site) => {
                    const priceInfo = materialPrices.find(p => p.platform.toLowerCase() === site.name.toLowerCase());

                    return (
                        <a key={site.name} href={site.url} target="_blank" rel="noopener noreferrer" className="block">
                            <Card className="hover:border-amber-500 hover:shadow-md transition-all h-full flex flex-col">
                                <CardHeader className="flex flex-row items-center justify-between p-4">
                                    <CardTitle className="text-base font-medium text-stone-800">{site.name}</CardTitle>
                                    <ExternalLink className="h-4 w-4 text-stone-500" />
                                </CardHeader>
                                <CardContent className="p-4 pt-0 flex-grow flex flex-col justify-end">
                                    {isFetchingPrices ? (
                                        <div className="space-y-2">
                                            <Skeleton className="h-6 w-24 bg-stone-200/80" />
                                            <Skeleton className="h-4 w-16 bg-stone-200/80" />
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-lg font-semibold text-amber-700">
                                                {priceInfo?.averagePrice || 'Not available'}
                                            </p>
                                            <p className="text-xs text-stone-500 mt-1">Avg. price</p>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </a>
                    )
                })}
              </div>
              <Separator className="my-6" />
              <h3 className="text-lg font-semibold text-stone-800 mb-3">
                Find Local Shops
              </h3>
            </div>
          )}

          {/* Results Table */}
          <ScrollArea className="h-[450px] border rounded-md">
            <Table>
              <TableHeader className="bg-stone-50 sticky top-0">
                <TableRow>
                  <TableHead>{t("sourcingPricingPage.name")}</TableHead>
                  <TableHead>{t("sourcingPricingPage.address")}</TableHead>
                  <TableHead className="text-right">
                    {t("sourcingPricingPage.viewOnMap")}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {places.length === 0 ? (
                  <TablePlaceholder />
                ) : (
                  places.map((place, idx) => (
                    <TableRow key={idx} className="hover:bg-amber-50">
                      <TableCell className="font-medium">{place.name}</TableCell>
                      <TableCell>{place.address}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="border-amber-500 text-amber-600"
                        >
                          <a
                            target="_blank"
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${place.name}, ${place.address}`
                            )}`}
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            {t("sourcingPricingPage.map")}
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
