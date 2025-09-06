import { NextRequest, NextResponse } from 'next/server';
import { VideoAPI } from '@/lib/video-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Check video status using the AI API
    const status = await VideoAPI.checkVideoStatus(videoId);

    return NextResponse.json(status);

  } catch (error) {
    console.error('Video status API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check video status', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { 
      message: 'Video status API is active',
      endpoint: '/api/video-status',
      method: 'GET',
      description: 'Check video generation status',
      requiredParams: ['id'],
      usage: '/api/video-status?id=VIDEO_ID'
    },
    { status: 200 }
  );
}