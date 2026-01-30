"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Loader2 } from "lucide-react";

export default function CropPlanningPage() {
  const [location, setLocation] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [soilType, setSoilType] = useState("");
  const [season, setSeason] = useState("");
  const [cropPlan, setCropPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGeneratePlan = async () => {
    if (!location || !farmSize || !season) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Simulated AI response
      const mockPlan = {
        recommendedCrops: [
          {
            name: "Wheat",
            area: "40%",
            expectedYield: "3-4 tons/hectare",
            profitability: "High",
            reason: "Suitable for current season and soil type"
          },
          {
            name: "Mustard",
            area: "30%",
            expectedYield: "1.5-2 tons/hectare", 
            profitability: "Medium",
            reason: "Good companion crop, oil seed demand"
          },
          {
            name: "Chickpea",
            area: "30%",
            expectedYield: "2-2.5 tons/hectare",
            profitability: "High",
            reason: "Nitrogen fixing, good market price"
          }
        ],
        timeline: [
          { month: "November", activity: "Land preparation and sowing" },
          { month: "December", activity: "First irrigation and fertilizer application" },
          { month: "January", activity: "Weed management and pest monitoring" },
          { month: "February", activity: "Second irrigation and top dressing" },
          { month: "March", activity: "Harvesting preparation" },
          { month: "April", activity: "Harvesting and post-harvest management" }
        ],
        totalInvestment: "₹45,000 - ₹55,000",
        expectedRevenue: "₹85,000 - ₹1,10,000",
        profitMargin: "40-50%"
      };

      setTimeout(() => {
        setCropPlan(mockPlan);
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error(error);
      alert("Failed to generate crop plan. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Calendar className="h-8 w-8 text-green-600" />
          Crop Planning Assistant
        </h1>
        <p className="text-muted-foreground">
          Get AI-powered crop recommendations based on your farm conditions
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Farm Details</CardTitle>
          <CardDescription>
            Provide your farm information to get personalized crop planning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Punjab, Haryana"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="farmSize">Farm Size (acres) *</Label>
              <Input
                id="farmSize"
                type="number"
                placeholder="e.g., 5"
                value={farmSize}
                onChange={(e) => setFarmSize(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="soilType">Soil Type</Label>
              <Select value={soilType} onValueChange={setSoilType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clay">Clay</SelectItem>
                  <SelectItem value="loamy">Loamy</SelectItem>
                  <SelectItem value="sandy">Sandy</SelectItem>
                  <SelectItem value="black">Black Cotton</SelectItem>
                  <SelectItem value="red">Red Soil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="season">Season *</Label>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kharif">Kharif (Monsoon)</SelectItem>
                  <SelectItem value="rabi">Rabi (Winter)</SelectItem>
                  <SelectItem value="summer">Summer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGeneratePlan} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Crop Plan...
              </>
            ) : (
              "Generate Crop Plan"
            )}
          </Button>
        </CardContent>
      </Card>

      {cropPlan && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Financial Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-green-600">Total Investment</p>
                <p className="text-2xl font-bold text-green-700">{cropPlan.totalInvestment}</p>
              </div>
              <div>
                <p className="text-sm text-green-600">Expected Revenue</p>
                <p className="text-2xl font-bold text-green-700">{cropPlan.expectedRevenue}</p>
              </div>
              <div>
                <p className="text-sm text-green-600">Profit Margin</p>
                <p className="text-2xl font-bold text-green-700">{cropPlan.profitMargin}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommended Crop Mix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cropPlan.recommendedCrops.map((crop: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{crop.name}</h3>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {crop.area} of farm
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Expected Yield: </span>
                        <span className="font-medium">{crop.expectedYield}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Profitability: </span>
                        <span className={`font-medium ${crop.profitability === 'High' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {crop.profitability}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{crop.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Farming Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cropPlan.timeline.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 p-3 border-l-4 border-green-500 bg-green-50">
                    <div className="font-semibold text-green-700 min-w-[100px]">
                      {item.month}
                    </div>
                    <div className="text-sm">{item.activity}</div>
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