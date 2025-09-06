import { NextRequest, NextResponse } from 'next/server';
import { VideoAPI } from '@/lib/video-api';
import { VideoGenerationRequest } from '@/types/video';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as VideoGenerationRequest;

    // Validate required fields
    if (!body.prompt || body.prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Video prompt is required' },
        { status: 400 }
      );
    }

    // Validate prompt length (reasonable limits)
    if (body.prompt.length > 2000) {
      return NextResponse.json(
        { error: 'Prompt is too long. Please limit to 2000 characters.' },
        { status: 400 }
      );
    }

    // Set reasonable defaults
    const videoRequest: VideoGenerationRequest = {
      prompt: body.prompt.trim(),
      duration: Math.min(Math.max(body.duration || 5, 1), 30), // 1-30 seconds
      aspectRatio: body.aspectRatio || 'landscape',
      quality: body.quality || 'standard',
      style: body.style?.trim() || undefined
    };

    // Generate video using the AI API
    const result = await VideoAPI.generateVideo(videoRequest);

    // Return the generation response
    return NextResponse.json(result);

  } catch (error) {
    console.error('Video generation API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Video generation failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Video generation API is active',
      endpoint: '/api/generate-video',
      method: 'POST',
      description: 'Generate videos using AI',
      requiredFields: ['prompt'],
      optionalFields: ['duration', 'aspectRatio', 'quality', 'style']
    },
    { status: 200 }
  );
}