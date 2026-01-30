import Link from "next/link";
import Image from "next/image";
import type { Challenge } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { SubmissionCounter } from "./submission-counter";

type ChallengeCardProps = {
  challenge: Challenge;
};

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  return (
    <Link
      href={`/artconnect/challenges/${challenge.id}`}
      className="group block"
    >
      {/* ## Updated Card Style ## */}
      <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1.5 bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg">
        <CardHeader className="p-0">
          <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-t-lg">
            <Image
              src={challenge.imageUrl}
              alt={challenge.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={challenge.imageHint}
            />
          </div>
          <div className="flex items-center justify-between px-6">
            {/* ## Updated Title Color ## */}
            <CardTitle className="font-headline text-2xl text-stone-900">
              {challenge.title}
            </CardTitle>
            {challenge.status && (
              // ## Updated Badge Colors ##
              <Badge
                variant={
                  challenge.status === "Active" ? "default" : "secondary"
                }
                className={cn(
                  "border",
                  challenge.status === "Active"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-stone-100 text-stone-600 border-stone-200"
                )}
              >
                {challenge.status}
              </Badge>
            )}
          </div>
          {/* ## Updated Description Color ## */}
          <CardDescription className="line-clamp-2 pt-2 px-6 pb-6 text-base text-stone-600">
            {challenge.description}
          </CardDescription>
        </CardHeader>
        {/* ## Updated Footer Style ## */}
        <CardFooter className="mt-auto flex items-center justify-between bg-stone-50/50 p-4">
          <SubmissionCounter challengeId={challenge.id} />
          {/* ## Updated Link Color ## */}
          <div className="flex items-center text-sm font-semibold text-amber-600">
            View Challenge
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
