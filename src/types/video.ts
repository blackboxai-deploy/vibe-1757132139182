export interface VideoGenerationRequest {
  prompt: string;
  duration?: number;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
  quality?: 'standard' | 'high' | 'premium';
  style?: string;
}

export interface VideoGenerationResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  progress?: number;
  estimatedTimeRemaining?: number;
  createdAt: string;
  completedAt?: string;
}

export interface Video {
  id: string;
  prompt: string;
  status: VideoGenerationResponse['status'];
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  aspectRatio: string;
  quality: string;
  style?: string;
  createdAt: string;
  completedAt?: string;
  fileSize?: number;
}

export interface VideoSettings {
  systemPrompt: string;
  defaultDuration: number;
  defaultAspectRatio: VideoGenerationRequest['aspectRatio'];
  defaultQuality: VideoGenerationRequest['quality'];
  maxConcurrentGenerations: number;
  autoDownload: boolean;
}

export interface GenerationStats {
  totalGenerated: number;
  totalProcessingTime: number;
  successRate: number;
  storageUsed: number;
  lastGenerated?: string;
}