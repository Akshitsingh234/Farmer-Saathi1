"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, PenTool, MapPin, Calendar } from "lucide-react";

export default function FarmerStoriesPage() {
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");

  const stories = [
    {
      id: 1,
      author: "Rajesh Kumar",
      location: "Punjab",
      date: "2 days ago",
      title: "From Traditional to Organic: My 5-Year Journey",
      content: "Five years ago, I decided to transition my 10-acre wheat farm to organic farming. It wasn't easy - the first two years were challenging with lower yields and pest issues. But with proper guidance and patience, I've now achieved 85% of my previous yields with organic methods. The best part? My soil health has improved dramatically, and I'm getting premium prices for organic wheat. My advice to fellow farmers: start small, be patient, and focus on soil health first.",
      likes: 45,
      comments: 12,
      category: "Organic Farming",
      crop: "Wheat"
    },
    {
      id: 2,
      author: "Priya Sharma",
      location: "Maharashtra",
      date: "1 week ago",
      title: "Drip Irrigation Changed Everything",
      content: "Water scarcity was killing my tomato crops every summer. Last year, I invested in a drip irrigation system with government subsidy. The results were amazing - 40% water savings and 25% increase in yield! The initial investment was ₹80,000 for 2 acres, but I recovered it in just one season. Now my neighbors are also planning to install drip systems. Technology can truly transform farming if we embrace it.",
      likes: 67,
      comments: 18,
      category: "Water Management",
      crop: "Tomato"
    },
    {
      id: 3,
      author: "Suresh Patel",
      location: "Gujarat",
      date: "3 weeks ago",
      title: "Crop Diversification Success Story",
      content: "I used to grow only cotton on my 8-acre farm. Market fluctuations were stressful. This year, I diversified - 4 acres cotton, 2 acres groundnut, 2 acres vegetables. Even though cotton prices dropped, my overall income increased by 30%! Diversification not only reduced risk but also improved my soil health through crop rotation. Planning to add fruit trees next year.",
      likes: 89,
      comments: 24,
      category: "Crop Diversification",
      crop: "Mixed Crops"
    }
  ];

  const handleSubmitStory = () => {
    if (!title || !story) {
      alert("Please fill in both title and story");
      return;
    }
    alert("Story submitted successfully!");
    setTitle("");
    setStory("");
    setShowWriteForm(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <PenTool className="h-8 w-8 text-green-600" />
          Farmer Stories
        </h1>
        <p className="text-muted-foreground">
          Share your farming journey and connect with fellow farmers
        </p>
      </div>

      {/* Write Story Button */}
      <div className="mb-6">
        <Button 
          onClick={() => setShowWriteForm(!showWriteForm)}
          className="bg-green-600 hover:bg-green-700"
        >
          <PenTool className="h-4 w-4 mr-2" />
          {showWriteForm ? "Cancel" : "Share Your Story"}
        </Button>
      </div>

      {/* Write Story Form */}
      {showWriteForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Share Your Farming Story</CardTitle>
            <CardDescription>
              Tell fellow farmers about your experiences, challenges, and successes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Story title (e.g., 'My Organic Farming Journey')"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Textarea
                placeholder="Share your story, challenges, solutions, and advice for fellow farmers..."
                value={story}
                onChange={(e) => setStory(e.target.value)}
                rows={6}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmitStory}>
                Publish Story
              </Button>
              <Button variant="outline" onClick={() => setShowWriteForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stories Feed */}
      <div className="space-y-6">
        {stories.map((story) => (
          <Card key={story.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {story.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{story.author}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {story.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {story.date}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{story.category}</Badge>
                  <Badge variant="outline">{story.crop}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-xl font-bold mb-3">{story.title}</h2>
                <p className="text-gray-700 leading-relaxed">{story.content}</p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">{story.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">{story.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Community Guidelines */}
      <div className="mt-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
        <h2 className="text-xl font-bold text-green-800 mb-4">Community Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
          <div>
            <h3 className="font-semibold mb-2">✓ Share authentic experiences</h3>
            <p>Tell real stories about your farming journey, challenges, and solutions</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">✓ Be respectful and supportive</h3>
            <p>Help fellow farmers with constructive advice and encouragement</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">✓ Include practical details</h3>
            <p>Share specific techniques, costs, and results to help others</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">✓ Connect and learn</h3>
            <p>Engage with other farmers' stories and build lasting connections</p>
          </div>
        </div>
      </div>
    </div>
  );
}