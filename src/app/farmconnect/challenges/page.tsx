"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Trophy, Leaf, Target, Clock } from "lucide-react";

export default function FarmingChallengesPage() {
  const [activeTab, setActiveTab] = useState("active");

  const activeChallenges = [
    {
      id: 1,
      title: "Water Conservation Challenge",
      description: "Reduce water usage by 30% while maintaining crop yield using innovative irrigation techniques",
      duration: "30 days",
      participants: 156,
      reward: "₹10,000 + Certificate",
      difficulty: "Medium",
      category: "Sustainability",
      deadline: "March 31, 2024",
      status: "Active"
    },
    {
      id: 2,
      title: "Organic Farming Transition",
      description: "Successfully transition 1 acre of land to organic farming practices",
      duration: "90 days",
      participants: 89,
      reward: "₹25,000 + Organic Certification Support",
      difficulty: "Hard",
      category: "Organic",
      deadline: "June 15, 2024",
      status: "Active"
    },
    {
      id: 3,
      title: "Crop Diversification Challenge",
      description: "Grow 3 different crops in rotation to improve soil health and reduce pest issues",
      duration: "120 days",
      participants: 234,
      reward: "₹15,000 + Seeds Package",
      difficulty: "Medium",
      category: "Innovation",
      deadline: "July 30, 2024",
      status: "Active"
    }
  ];

  const pastChallenges = [
    {
      id: 4,
      title: "Smart Pest Management",
      description: "Implement IPM techniques to reduce pesticide use by 50%",
      duration: "45 days",
      participants: 312,
      reward: "₹8,000 + Training Certificate",
      difficulty: "Easy",
      category: "Technology",
      deadline: "February 28, 2024",
      status: "Completed",
      winner: "Rajesh Kumar, Punjab"
    },
    {
      id: 5,
      title: "Soil Health Improvement",
      description: "Increase soil organic matter by 2% using natural methods",
      duration: "60 days",
      participants: 198,
      reward: "₹12,000 + Soil Testing Kit",
      difficulty: "Medium",
      category: "Sustainability",
      deadline: "January 15, 2024",
      status: "Completed",
      winner: "Priya Sharma, Maharashtra"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Sustainability": "bg-green-100 text-green-800",
      "Organic": "bg-emerald-100 text-emerald-800",
      "Innovation": "bg-blue-100 text-blue-800",
      "Technology": "bg-purple-100 text-purple-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Trophy className="h-8 w-8 text-green-600" />
          Farming Challenges
        </h1>
        <p className="text-muted-foreground">
          Participate in sustainable farming challenges and learn from fellow farmers
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "active" ? "default" : "ghost"}
          onClick={() => setActiveTab("active")}
          className="rounded-md"
        >
          Active Challenges
        </Button>
        <Button
          variant={activeTab === "past" ? "default" : "ghost"}
          onClick={() => setActiveTab("past")}
          className="rounded-md"
        >
          Past Challenges
        </Button>
      </div>

      {/* Active Challenges */}
      {activeTab === "active" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeChallenges.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getCategoryColor(challenge.category)}>
                      {challenge.category}
                    </Badge>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {challenge.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>{challenge.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-green-600" />
                      <span>{challenge.participants} joined</span>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">Reward</span>
                    </div>
                    <p className="text-sm text-yellow-700">{challenge.reward}</p>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <Calendar className="h-4 w-4" />
                    <span>Deadline: {challenge.deadline}</span>
                  </div>

                  <Button className="w-full">
                    Join Challenge
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Challenges */}
      {activeTab === "past" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastChallenges.map((challenge) => (
              <Card key={challenge.id} className="opacity-75">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getCategoryColor(challenge.category)}>
                      {challenge.category}
                    </Badge>
                    <Badge variant="outline" className="text-gray-600">
                      Completed
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {challenge.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>{challenge.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-green-600" />
                      <span>{challenge.participants} participated</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                      <Trophy className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-800">Winner</span>
                    </div>
                    <p className="text-sm text-green-700">{challenge.winner}</p>
                  </div>

                  <Button variant="outline" className="w-full" disabled>
                    Challenge Ended
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Benefits Section */}
      <div className="mt-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-center gap-2 mb-4">
          <Leaf className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-green-800">Why Join Challenges?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-green-700 mb-2">Learn New Techniques</h3>
            <p className="text-green-600">Discover innovative farming methods from experts and peers</p>
          </div>
          <div>
            <h3 className="font-semibold text-green-700 mb-2">Win Rewards</h3>
            <p className="text-green-600">Earn cash prizes, certificates, and farming equipment</p>
          </div>
          <div>
            <h3 className="font-semibold text-green-700 mb-2">Build Community</h3>
            <p className="text-green-600">Connect with like-minded farmers across the country</p>
          </div>
          <div>
            <h3 className="font-semibold text-green-700 mb-2">Improve Sustainability</h3>
            <p className="text-green-600">Adopt eco-friendly practices for better soil and environment</p>
          </div>
        </div>
      </div>
    </div>
  );
}