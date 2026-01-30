"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  Calendar,
  Target,
  Sprout,
  Package,
  Building2,
  CheckCircle,
  Users,
  PenTool,
  BarChart3,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const features = [
    {
      name: "Agricultural Insights",
      path: "/farmer-assist",
      icon: BarChart3,
    },
    {
      name: "Crop Pricing",
      path: "/farmer-assist/crop-pricing",
      icon: TrendingUp,
    },
    {
      name: "Agricultural Events",
      path: "/farmer-assist/events",
      icon: Calendar,
    },
    {
      name: "Crop Advisory",
      path: "/crop-advisory",
      icon: Sprout,
    },
    {
      name: "Crop Planning",
      path: "/crop-planning",
      icon: Target,
    },
    {
      name: "Agricultural Schemes",
      path: "/schemes",
      icon: Building2,
    },
    {
      name: "Farmer Stories",
      path: "/farmconnect/stories",
      icon: PenTool,
    },
    {
      name: "Farming Challenges",
      path: "/farmconnect/challenges",
      icon: Target,
    },
    {
      name: "Farm Tasks",
      path: "/todo",
      icon: CheckCircle,
    },
    {
      name: "Farm Inventory",
      path: "/inventory",
      icon: Package,
    },
  ];

  return (
    <aside className="fixed w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-5 shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
          <Sprout className="h-6 w-6" />
          Farmer Saathi
        </h2>
        <p className="text-sm text-gray-600">Smart Farming Platform</p>
      </div>
      <nav>
        <ul className="space-y-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isActive = pathname === feature.path;

            return (
              <li key={feature.name}>
                <Link
                  href={feature.path}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all 
                    ${
                      isActive
                        ? "bg-green-500 text-white shadow-md scale-[1.02]"
                        : "text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-gray-800 hover:scale-[1.01]"
                    }`}
                >
                  <Icon
                    size={20}
                    className={`${
                      isActive
                        ? "text-white"
                        : "text-green-700 dark:text-green-400"
                    }`}
                  />
                  {feature.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
