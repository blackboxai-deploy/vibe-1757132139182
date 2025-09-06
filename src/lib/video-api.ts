import { VideoGenerationRequest, VideoGenerationResponse } from '@/types/video';

// Custom AI endpoint configuration (no API keys required)
const AI_ENDPOINT = 'https://oi-server.onrender.com/chat/completions';
const AI_HEADERS = {
  'customerId': 'batham89@gmail.com',
  'Content-Type': 'application/json',
  'Authorization': 'Bearer xxx'
};

// Default model for video generation
const VIDEO_MODEL = 'replicate/google/veo-3';

// Default system prompt for video generation
const DEFAULT_SYSTEM_PROMPT = `You are an expert video generation assistant. Generate high-quality videos based on user prompts. 

Guidelines:
- Create visually compelling and coherent video content
- Ensure smooth transitions and professional quality
- Follow the specified duration, aspect ratio, and style requirements
- Generate content that is appropriate and engaging
- Focus on visual storytelling and cinematic quality

Respond only with the video generation request, no additional text.`;

export class VideoAPI {
  private static systemPrompt = DEFAULT_SYSTEM_PROMPT;

  static setSystemPrompt(prompt: string) {
    this.systemPrompt = prompt;
  }

  static getSystemPrompt() {
    return this.systemPrompt;
  }

  static async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      // Enhanced prompt with technical specifications
      const enhancedPrompt = this.buildEnhancedPrompt(request);

      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: AI_HEADERS,
        body: JSON.stringify({
          model: VIDEO_MODEL,
          messages: [
            {
              role: 'system',
              content: this.systemPrompt
            },
            {
              role: 'user',
              content: enhancedPrompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Video generation failed: ${response.status} ${response.statusText}`);
      }

      // Parse response for potential error details
      const responseData = await response.json();
      console.log('AI API Response:', responseData);
      
      // Generate unique ID for this video request
      const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        id: videoId,
        status: 'processing',
        progress: 0,
        estimatedTimeRemaining: 300, // 5 minutes default
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Video generation error:', error);
      
      const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        id: videoId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        createdAt: new Date().toISOString()
      };
    }
  }

  static async checkVideoStatus(videoId: string): Promise<VideoGenerationResponse> {
    try {
      // In a real implementation, this would check the actual status
      // For demo purposes, we'll simulate progress
      const progress = Math.min(100, (Date.now() % 300000) / 3000); // Simulate 5-minute generation
      
      if (progress >= 100) {
        return {
          id: videoId,
          status: 'completed',
          videoUrl: `https://placehold.co/1920x1080.mp4?text=Generated+Video+${videoId}`,
          thumbnailUrl: `https://placehold.co/1920x1080?text=Video+Thumbnail+${videoId}`,
          progress: 100,
          createdAt: new Date(Date.now() - 300000).toISOString(),
          completedAt: new Date().toISOString()
        };
      }

      return {
        id: videoId,
        status: 'processing',
        progress: Math.round(progress),
        estimatedTimeRemaining: Math.round((100 - progress) * 3),
        createdAt: new Date(Date.now() - (progress * 3000)).toISOString()
      };
    } catch (error) {
      console.error('Video status check error:', error);
      return {
        id: videoId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Status check failed',
        createdAt: new Date().toISOString()
      };
    }
  }

  private static buildEnhancedPrompt(request: VideoGenerationRequest): string {
    const { prompt, duration = 5, aspectRatio = 'landscape', quality = 'standard', style } = request;
    
    let enhancedPrompt = `Generate a video: ${prompt}`;
    
    // Add technical specifications
    enhancedPrompt += `\n\nTechnical Requirements:`;
    enhancedPrompt += `\n- Duration: ${duration} seconds`;
    enhancedPrompt += `\n- Aspect Ratio: ${aspectRatio}`;
    enhancedPrompt += `\n- Quality: ${quality}`;
    
    if (style) {
      enhancedPrompt += `\n- Style: ${style}`;
    }
    
    // Add cinematic guidance
    enhancedPrompt += `\n\nCinematic Guidelines:`;
    enhancedPrompt += `\n- Ensure smooth motion and professional transitions`;
    enhancedPrompt += `\n- Maintain visual coherence throughout the video`;
    enhancedPrompt += `\n- Focus on engaging visual storytelling`;
    enhancedPrompt += `\n- Create compelling and appropriate content`;
    
    return enhancedPrompt;
  }

  static async downloadVideo(videoUrl: string, filename: string): Promise<void> {
    try {
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error('Failed to download video');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Video download error:', error);
      throw error;
    }
  }
}