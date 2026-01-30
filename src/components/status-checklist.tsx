"use client";

import type { ChecklistItem, ChecklistItemStatus } from "@/lib/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Circle, CircleCheck, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";

type StatusChecklistProps = {
  items: ChecklistItem[];
};

// ## Updated Icon Colors ##
const statusIcons: Record<ChecklistItemStatus, React.ReactElement> = {
  completed: <CircleCheck className="h-5 w-5 text-emerald-600" />,
  current: <LoaderCircle className="h-5 w-5 animate-spin text-amber-600" />,
  upcoming: <Circle className="h-5 w-5 text-stone-400" />,
};

// ## Updated Text Styles ##
const statusStyles: Record<ChecklistItemStatus, string> = {
  completed: "text-stone-800 line-through",
  current: "text-amber-700 font-bold",
  upcoming: "text-stone-500",
};

export default function StatusChecklist({ items }: StatusChecklistProps) {
  const { t } = useLanguage();
  return (
    // ## Updated Card Style ##
    <Card className="bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg transition-all duration-300 hover:border-amber-300/80">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-stone-900">
          {t("applicationChecklist")}
        </CardTitle>
        <CardDescription className="text-stone-600">
          {t("applicationChecklistDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-4 transition-all duration-300"
            >
              {statusIcons[item.status]}
              <span className={cn("flex-1 text-md", statusStyles[item.status])}>
                {t(item.text)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
