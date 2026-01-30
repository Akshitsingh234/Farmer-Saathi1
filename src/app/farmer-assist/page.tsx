"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, BarChart3, Users } from "lucide-react";

export default function FarmerAssistPage() {
  const tools = [
    {
      title: "Crop Pricing & Markets",
      description: "Find best markets for your crops and get optimal pricing recommendations",
      icon: TrendingUp,
      href: "/farmer-assist/crop-pricing",
      color: "text-green-600"
    },
    {
      title: "Agricultural Events",
      description: "Discover local and national agricultural fairs, training programs, and farmer meets",
      icon: Calendar,
      href: "/farmer-assist/events",
      color: "text-blue-600"
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-green-600" />
          Agricultural Insights
        </h1>
        <p className="text-muted-foreground">
          AI-powered tools to help you make informed farming decisions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool, index) => {
          const IconComponent = tool.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className={`h-6 w-6 ${tool.color}`} />
                  {tool.title}
                </CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={tool.href}>Open Tool</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-green-800">Why Use Farmer Assist?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-green-700 mb-2">Market Intelligence</h3>
            <p className="text-green-600">Get real-time market data and pricing insights to maximize your profits</p>
          </div>
          <div>
            <h3 className="font-semibold text-green-700 mb-2">Learning Opportunities</h3>
            <p className="text-green-600">Stay updated with agricultural events and training programs in your area</p>
          </div>
          <div>
            <h3 className="font-semibold text-green-700 mb-2">AI-Powered Recommendations</h3>
            <p className="text-green-600">Leverage artificial intelligence for smarter farming decisions</p>
          </div>
          <div>
            <h3 className="font-semibold text-green-700 mb-2">Community Connection</h3>
            <p className="text-green-600">Connect with fellow farmers and agricultural experts nationwide</p>
          </div>
        </div>
      </div>
    </div>
  );
}