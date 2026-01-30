"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sprout } from "lucide-react";

export default function CropAdvisoryPage() {
  const [cropType, setCropType] = useState("");
  const [location, setLocation] = useState("");
  const [season, setSeason] = useState("");
  const [soilType, setSoilType] = useState("");
  const [issue, setIssue] = useState("");
  const [advice, setAdvice] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGetAdvice = async () => {
    if (!cropType || !location || !season) {
      alert("Please fill in crop type, location, and season");
      return;
    }

    setLoading(true);
    try {
      // Simulated AI response - in production, this would call the actual AI flow
      const mockAdvice = {
        advice: `For growing ${cropType} in ${location} during ${season}:\n\n1. Soil Preparation: Ensure proper soil pH and add organic matter\n2. Irrigation: Maintain consistent moisture levels, especially during flowering\n3. Fertilization: Apply balanced NPK fertilizer at recommended intervals\n4. Pest Management: Monitor for common pests and use integrated pest management\n5. Weather Monitoring: Keep track of weather patterns and adjust practices accordingly`,
        recommendations: [
          `Use certified seeds for ${cropType}`,
          "Implement drip irrigation for water efficiency",
          "Apply organic compost before planting",
          "Monitor soil moisture regularly",
          "Practice crop rotation for soil health"
        ],
        bestPractices: [
          "Regular field inspection for early pest detection",
          "Maintain proper plant spacing",
          "Use mulching to conserve moisture",
          "Keep detailed farming records",
          "Join local farmer groups for knowledge sharing"
        ]
      };

      setTimeout(() => {
        setAdvice(mockAdvice);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error(error);
      alert("Failed to get advice. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Sprout className="h-8 w-8 text-green-600" />
          Crop Advisory
        </h1>
        <p className="text-muted-foreground">
          Get AI-powered farming advice tailored to your crop and location
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tell us about your crop</CardTitle>
          <CardDescription>
            Provide details to get personalized farming recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cropType">Crop Type *</Label>
              <Input
                id="cropType"
                placeholder="e.g., Wheat, Rice, Tomato"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Punjab, Maharashtra"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="season">Season *</Label>
              <Input
                id="season"
                placeholder="e.g., Kharif, Rabi, Summer"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="soilType">Soil Type (Optional)</Label>
              <Input
                id="soilType"
                placeholder="e.g., Clay, Loamy, Sandy"
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="issue">Specific Issue or Question (Optional)</Label>
            <Textarea
              id="issue"
              placeholder="Describe any specific farming challenge or question..."
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={handleGetAdvice} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting Advice...
              </>
            ) : (
              "Get Farming Advice"
            )}
          </Button>
        </CardContent>
      </Card>

      {advice && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Farming Advice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm">{advice.advice}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {advice.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {advice.bestPractices.map((practice: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">★</span>
                      <span className="text-sm">{practice}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
