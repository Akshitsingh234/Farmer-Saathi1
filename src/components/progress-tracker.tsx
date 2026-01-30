"use client";

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Progress } from './ui/progress';
import { useLanguage } from '@/context/language-context';

type ProgressTrackerProps = {
  stages: { name: string; icon: LucideIcon }[];
  currentStage: number;
};

export default function ProgressTracker({ stages, currentStage }: ProgressTrackerProps) {
  const progressPercentage = currentStage > 0 ? ((currentStage-1) / (stages.length - 1)) * 100 : 0;
  const { t } = useLanguage();
  
  return (
    <div className="w-full">
      <Progress value={progressPercentage} className="mb-4 h-2" />
      <div className="flex justify-between">
        {stages.map((stage, index) => {
          const isActive = index + 1 <= currentStage;
          const isCurrent = index + 1 === currentStage;
          return (
            <div key={stage.name} className="flex flex-col items-center text-center w-1/4">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300',
                  isActive ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card',
                  isCurrent && 'animate-pulse'
                )}
              >
                <stage.icon className="h-6 w-6" />
              </div>
              <p
                className={cn(
                  'mt-2 text-sm font-medium',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {t(stage.name)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
