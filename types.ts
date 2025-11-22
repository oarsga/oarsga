export interface ReferenceImage {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '3:4' | '4:3';

export interface GenerationParams {
  prompt: string;
  negativePrompt: string;
  aspectRatio: AspectRatio;
  seed: number | null; // null means random
  referenceImages: ReferenceImage[];
}

export type JobStatus = 'pending' | 'generating' | 'completed' | 'failed' | 'cancelled';

export interface Job {
  id: string;
  timestamp: number;
  params: GenerationParams;
  status: JobStatus;
  resultUrl?: string;
  error?: string;
  actualSeed?: number;
}

export interface IconProps {
  className?: string;
  size?: number;
}