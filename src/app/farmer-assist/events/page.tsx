"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Loader2, ExternalLink } from "lucide-react";
import { openInGoogleMaps } from "@/lib/maps-utils";

export default function AgriculturalEventsPage() {
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [localEvents, setLocalEvents] = useState<any[]>([]);
  const [nationalEvents, setNationalEvents] = useState<any[]>([]);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [loadingNational, setLoadingNational] = useState(false);

  const handleFindLocalEvents = async () => {
    if (!state) {
      alert("Please enter state/region");
      return;
    }

    setLoadingLocal(true);
    try {
      // Mock local events data
      const mockLocalEvents = [
        {
          name: `${state} Farmers Fair 2024`,
          date: "March 15-17, 2024",
          location: `${state} Agricultural University`,
          description: "Annual farmers fair showcasing latest agricultural technologies and practices",
          link: "#"
        },
        {
          name: "Organic Farming Workshop",
          date: "March 22, 2024",
          location: `${state} Krishi Vigyan Kendra`,
          description: "Learn sustainable organic farming techniques and certification process",
          link: "#"
        },
        {
          name: "Crop Insurance Awareness Program",
          date: "March 28, 2024",
          location: `${state} District Collectorate`,
          description: "Government program on crop insurance schemes and benefits",
          link: "#"
        },
        {
          name: "Modern Irrigation Techniques Seminar",
          date: "April 5, 2024",
          location: `${state} Water Management Office`,
          description: "Training on drip irrigation, sprinkler systems, and water conservation",
          link: "#"
        }
      ];

      setTimeout(() => {
        setLocalEvents(mockLocalEvents);
        setLoadingLocal(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      setLoadingLocal(false);
    }
  };

  const handleFindNationalEvents = async () => {
    setLoadingNational(true);
    try {
      // Mock national events data
      const mockNationalEvents = [
        {
          name: "India International Agriculture Fair",
          date: "April 10-14, 2024",
          location: "New Delhi, India",
          description: "Largest agricultural exhibition in India showcasing farming innovations",
          link: "#"
        },
        {
          name: "National Farmers Conference",
          date: "April 20-22, 2024",
          location: "Mumbai, Maharashtra",
          description: "Conference on sustainable agriculture and farmer welfare policies",
          link: "#"
        },
        {
          name: "AgriTech Innovation Summit",
          date: "May 5-7, 2024",
          location: "Bangalore, Karnataka",
          description: "Technology summit focusing on AI and IoT in agriculture",
          link: "#"
        },
        {
          name: "Organic India Expo",
          date: "May 15-17, 2024",
          location: "Pune, Maharashtra",
          description: "Exhibition dedicated to organic farming and sustainable practices",
          link: "#"
        },
        {
          name: "National Seed Congress",
          date: "June 1-3, 2024",
          location: "Hyderabad, Telangana",
          description: "Congress on seed technology and crop improvement",
          link: "#"
        }
      ];

      setTimeout(() => {
        setNationalEvents(mockNationalEvents);
        setLoadingNational(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      setLoadingNational(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Calendar className="h-8 w-8 text-green-600" />
          Agricultural Events
        </h1>
        <p className="text-muted-foreground">
          Discover upcoming agricultural fairs, training programs, and farmer meets
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Local Events Section */}
        <Card>
          <CardHeader>
            <CardTitle>Find Local Events</CardTitle>
            <CardDescription>
              Discover upcoming events in your specific state or region
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="state">State / Region</Label>
              <Input
                id="state"
                placeholder="e.g., Punjab, Maharashtra"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <Button onClick={handleFindLocalEvents} disabled={loadingLocal} className="w-full">
              {loadingLocal ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding Events...
                </>
              ) : (
                "Find Local Events"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* National Events Section */}
        <Card>
          <CardHeader>
            <CardTitle>Find National Events</CardTitle>
            <CardDescription>
              Discover events across the entire country to expand your network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get information about major agricultural events, conferences, and exhibitions happening across India.
            </p>
            <Button onClick={handleFindNationalEvents} disabled={loadingNational} className="w-full">
              {loadingNational ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding Events...
                </>
              ) : (
                "Find National Events"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Local Events Results */}
      {localEvents.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Local Events in {state}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {localEvents.map((event, idx) => (
                <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-green-700">{event.name}</h3>
                    <Button variant="outline" size="sm" asChild>
                      <a href={event.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Register
                      </a>
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <button 
                        onClick={() => openInGoogleMaps(event.location)}
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {event.location}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* National Events Results */}
      {nationalEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              National Agricultural Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nationalEvents.map((event, idx) => (
                <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-green-700">{event.name}</h3>
                    <Button variant="outline" size="sm" asChild>
                      <a href={event.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Register
                      </a>
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <button 
                        onClick={() => openInGoogleMaps(event.location)}
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {event.location}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}