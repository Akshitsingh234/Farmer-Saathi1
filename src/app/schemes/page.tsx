"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, IndianRupee, Users, Clock, ExternalLink, Search } from "lucide-react";

export default function AgriculturalSchemesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const schemes = [
    {
      name: "PM-KISAN",
      fullName: "Pradhan Mantri Kisan Samman Nidhi",
      description: "Direct income support of ₹6,000 per year to small and marginal farmers",
      benefits: ["₹2,000 every 4 months", "Direct bank transfer", "No paperwork required"],
      eligibility: "Small & marginal farmers with up to 2 hectares land",
      category: "income-support",
      amount: "₹6,000/year",
      status: "Active",
      applyLink: "https://pmkisan.gov.in/"
    },
    {
      name: "PM Fasal Bima Yojana",
      fullName: "Pradhan Mantri Fasal Bima Yojana",
      description: "Crop insurance scheme providing financial support against crop loss",
      benefits: ["Low premium rates", "Quick claim settlement", "Coverage for all crops"],
      eligibility: "All farmers growing notified crops",
      category: "insurance",
      amount: "Up to ₹2 lakh coverage",
      status: "Active",
      applyLink: "https://pmfby.gov.in/"
    },
    {
      name: "KCC",
      fullName: "Kisan Credit Card",
      description: "Credit facility for farmers to meet agricultural expenses",
      benefits: ["Low interest rates", "Flexible repayment", "Insurance coverage"],
      eligibility: "All farmers with land ownership documents",
      category: "credit",
      amount: "Up to ₹3 lakh",
      status: "Active",
      applyLink: "https://www.india.gov.in/spotlight/kisan-credit-card-kcc"
    },
    {
      name: "Soil Health Card",
      fullName: "Soil Health Card Scheme",
      description: "Free soil testing and nutrient recommendations for farmers",
      benefits: ["Free soil testing", "Fertilizer recommendations", "Improved crop yield"],
      eligibility: "All farmers",
      category: "advisory",
      amount: "Free",
      status: "Active",
      applyLink: "https://soilhealth.dac.gov.in/"
    },
    {
      name: "PMKSY",
      fullName: "Pradhan Mantri Krishi Sinchayee Yojana",
      description: "Irrigation scheme to improve water use efficiency",
      benefits: ["Drip irrigation subsidy", "Water conservation", "Increased productivity"],
      eligibility: "All categories of farmers",
      category: "irrigation",
      amount: "Up to 55% subsidy",
      status: "Active",
      applyLink: "https://pmksy.gov.in/"
    },
    {
      name: "NABARD Schemes",
      fullName: "National Bank for Agriculture and Rural Development",
      description: "Various rural development and agricultural financing schemes",
      benefits: ["Low interest loans", "Rural infrastructure", "Skill development"],
      eligibility: "Farmers, SHGs, Rural entrepreneurs",
      category: "development",
      amount: "Varies by scheme",
      status: "Active",
      applyLink: "https://www.nabard.org/"
    }
  ];

  const categories = [
    { value: "all", label: "All Schemes" },
    { value: "income-support", label: "Income Support" },
    { value: "insurance", label: "Insurance" },
    { value: "credit", label: "Credit & Loans" },
    { value: "advisory", label: "Advisory Services" },
    { value: "irrigation", label: "Irrigation" },
    { value: "development", label: "Development" }
  ];

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || scheme.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "income-support": "bg-green-100 text-green-800",
      "insurance": "bg-blue-100 text-blue-800",
      "credit": "bg-purple-100 text-purple-800",
      "advisory": "bg-orange-100 text-orange-800",
      "irrigation": "bg-cyan-100 text-cyan-800",
      "development": "bg-pink-100 text-pink-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Building2 className="h-8 w-8 text-green-600" />
          Agricultural Schemes
        </h1>
        <p className="text-muted-foreground">
          Discover government schemes, subsidies, and support programs for farmers
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schemes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchemes.map((scheme, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge className={getCategoryColor(scheme.category)}>
                  {categories.find(c => c.value === scheme.category)?.label}
                </Badge>
                <Badge variant="outline" className="text-green-600">
                  {scheme.status}
                </Badge>
              </div>
              <CardTitle className="text-lg">{scheme.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {scheme.fullName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{scheme.description}</p>
              
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-700">{scheme.amount}</span>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Key Benefits:</h4>
                <ul className="space-y-1">
                  {scheme.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-xs flex items-start gap-1">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-1">Eligibility:</h4>
                <p className="text-xs text-muted-foreground">{scheme.eligibility}</p>
              </div>

              <Button asChild className="w-full">
                <a href={scheme.applyLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apply Now
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No schemes found matching your criteria.</p>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-green-800">Need Help?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-green-700 mb-2">Application Support</h3>
            <p className="text-green-600">Visit your nearest Common Service Center (CSC) for assistance with applications</p>
          </div>
          <div>
            <h3 className="font-semibold text-green-700 mb-2">Helpline</h3>
            <p className="text-green-600">Call 1800-180-1551 for PM-KISAN related queries</p>
          </div>
          <div>
            <h3 className="font-semibold text-green-700 mb-2">Documentation</h3>
            <p className="text-green-600">Keep Aadhaar, bank details, and land documents ready</p>
          </div>
          <div>
            <h3 className="font-semibold text-green-700 mb-2">Status Check</h3>
            <p className="text-green-600">Track your application status online using reference numbers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
