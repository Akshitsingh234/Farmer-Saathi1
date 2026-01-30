import type { GenerateMultiPlatformTextOutput } from '@/ai/posts_flow/generate-multi-platform-text';

export type DesignSet = {
  theme: string;
  images: string[];
};

export type GeneratedOutput = {
  textOutputs: GenerateMultiPlatformTextOutput;
  designSets: DesignSet[];
};
