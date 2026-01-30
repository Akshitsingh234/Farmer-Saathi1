"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, MapPin } from "lucide-react";

export default function CropPricingPage() {
  const [cropName, setCropName] = useState("");
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [priceData, setPriceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGetPricing = async () => {
    if (!cropName || !location) {
      alert("Please fill in crop name and location");
      return;
    }

    setLoading(true);
    try {
      // Simulated AI response - in production, this would call the actual AI flow
      const mockPriceData = {
        priceAnalysis: `Market analysis for ${cropName} in ${location}:\n\nCurrent market conditions show moderate to high demand. Prices have been stable over the past month with slight upward trend expected due to seasonal factors. Quality produce commands premium prices in urban markets.`,
        suggestedPrice: `₹28-35 per kg for ${cropName}`,
        marketTrends: [
          "Demand increasing due to festival season",
          "Supply slightly lower than last year",
          "Export opportunities available",
          "Urban markets offering better prices"
        ],
        bestSellingTime: "Early morning markets (6-9 AM) and evening markets (4-7 PM) show best prices",
        markets: [
          { name: "Main Agricultural Market", address: `${location} Mandi, Near Railway Station`, distance: "2.5 km" },
          { name: "Wholesale Vegetable Market", address: `${location} APMC Yard`, distance: "5 km" },
          { name: "Farmers Market", address: `${location} City Center`, distance: "8 km" }
        ]
      };

      setTimeout(() => {
        setPriceData(mockPriceData);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error(error);
      alert("Failed to get pricing data. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-green-600" />
          Crop Pricing & Markets
        </h1>
        <p className="text-muted-foreground">
          Get real-time market insights and optimal pricing for your crops
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Enter Crop Details</CardTitle>
          <CardDescription>
            Provide information to get market analysis and pricing recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cropName">Crop Name *</Label>
              <Input
                id="cropName"
                placeholder="e.g., Tomato, Wheat, Rice"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="location">Market Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Delhi, Mumbai"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity (kg)</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="e.g., 500"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleGetPricing} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Market...
              </>
            ) : (
              "Get Market Insights"
            )}
          </Button>
        </CardContent>
      </Card>

      {priceData && (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Suggested Price</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">{priceData.suggestedPrice}</p>
              <p className="text-sm text-green-600 mt-2">{priceData.bestSellingTime}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-line">{priceData.priceAnalysis}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {priceData.marketTrends.map((trend: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">📊</span>
                    <span className="text-sm">{trend}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Nearby Markets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {priceData.markets.map((market: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-green-500 pl-4 py-2">
                    <h3 className="font-semibold">{market.name}</h3>
                    <p className="text-sm text-muted-foreground">{market.address}</p>
                    <p className="text-xs text-green-600 mt-1">📍 {market.distance}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
