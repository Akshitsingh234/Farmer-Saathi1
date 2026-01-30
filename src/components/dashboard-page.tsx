
'use client';

import {
  Store,
  Lightbulb,
  CalendarDays,
  FileText,
  ChevronRight,
  Home,
  CheckSquare,
} from 'lucide-react';
import { ArtisanAssistIcon, SourcingIcon, ProductIdeasIcon, EventsIcon } from '@/components/ui/icons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const features = [
   {
    icon: <SourcingIcon className="h-8 w-8 mb-4 text-primary" />,
    title: 'Sourcing & Selling',
    description: 'Find local shops to sell your products or buy raw materials. Get AI-powered price suggestions.',
    link: '/artisan-assist/sourcing-pricing',
    linkText: 'Find Shops'
  },
  {
    icon: <ProductIdeasIcon className="h-8 w-8 mb-4 text-primary" />,
    title: 'ArtisianGali',
    description: 'Get personalized enhancement ideas for your products based on current market trends.',
    link: '/artisan-assist/ideas-trends',
    linkText: 'Get Ideas'
  },
  {
    icon: <EventsIcon className="h-8 w-8 mb-4 text-primary" />,
    title: 'Events & Fairs',
    description: 'Discover upcoming craft fairs, exhibitions, and markets in your state or country.',
    link: '/artisan-assist/events',
    linkText: 'Find Events'
  },
  {
    icon: <FileText className="h-8 w-8 mb-4 text-primary" />,
    title: 'Government Schemes',
    description: 'Find relevant government schemes, grants, and support programs for artisans.',
    link: '/schemes',
    linkText: 'Find Schemes'
  },
    {
    icon: <CheckSquare className="h-8 w-8 mb-4 text-primary" />,
    title: 'To-Do List',
    description: 'A simple and effective way to manage your daily tasks and set reminders.',
    link: '/artisan-assist/to-do',
    linkText: 'Go to To-Do List'
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center py-12">
           <ArtisanAssistIcon className="h-16 w-16 text-primary mb-4 mx-auto" />
          <h2 className="text-4xl font-bold tracking-tight">Welcome to ArtisanAssist</h2>
           <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              Your AI-powered co-pilot for navigating the world of artisan commerce. Here are some tools to get you started.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="flex flex-col">
              <CardHeader className="items-center text-center">
                {feature.icon}
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground text-center">{feature.description}</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={feature.link}>{feature.linkText}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
