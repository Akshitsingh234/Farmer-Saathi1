// artisan-assist/page.tsx
"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeDollarSign, Lightbulb, Calendar } from "lucide-react";
import React from "react";
import { useLanguage } from "@/context/language-context";

export default function ArtisanAssistPage() {
  const { t } = useLanguage();
  const services = [
    {
      title: t("artisanAssistPage.sourcingPricing.title"),
      description: t("artisanAssistPage.sourcingPricing.description"),
      href: "/artisan-assist/sourcing-pricing",
      // Icon color is now controlled by the gradient bubble
      icon: <BadgeDollarSign className="h-8 w-8" />,
    },
    {
      title: t("artisanAssistPage.events.title"),
      description: t("artisanAssistPage.events.description"),
      href: "/artisan-assist/events",
      icon: <Calendar className="h-8 w-8" />,
    },
  ];

  return (
    // Updated page background and padding
    <div className="flex flex-col flex-grow p-4 h-screen md:p-8 bg-gradient-to-b from-[#FBF9F6] to-amber-50 text-stone-800 w-full">
      {/* Updated title style */}
      <h1 className="text-5xl font-bold text-stone-900 mb-[8vh]">
        {t("artisanAssistPage.title")}
      </h1>
      <div className="gap-6 flex items-center">
        {services.map((service) => (
          // Added 'group' for hover effects on the icon bubble
          <Link href={service.href} key={service.title} className="group">
            {/* Updated Card: New layout (flex-col), new style, and h-full for grid alignment */}
            <Card className="bg-white/50 backdrop-blur-lg border border-stone-200/80 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col">
              <CardHeader className="pb-4">
                {/* 1. New Icon Bubble (matches homepage) */}
                <div className="w-16 h-16 mb-2 flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-rose-200 text-amber-700 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                  {service.icon}
                </div>
              </CardHeader>

              {/* flex-grow pushes the link to the bottom */}
              <CardContent className="flex flex-col flex-grow">
                {/* 2. Title */}
                <CardTitle className="text-xl font-bold text-stone-800 mb-2">
                  {service.title}
                </CardTitle>

                {/* 3. Description (flex-grow pushes link) */}
                <p className="text-stone-600 flex-grow">
                  {service.description}
                </p>

                {/* 4. New "Open Tool" Link */}
                <div className="font-bold text-amber-600 hover:text-rose-600 transition-colors duration-300 flex items-center group mt-4">
                  {t("artisanAssistPage.openTool")}
                  <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
