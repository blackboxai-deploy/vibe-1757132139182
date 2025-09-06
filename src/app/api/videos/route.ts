import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const videoId = searchParams.get('id');

    if (action === 'download' && videoId) {
      // Handle video download request
      return NextResponse.json(
        { 
          message: 'Video download',
          videoId,
          downloadUrl: `https://placehold.co/1920x1080.mp4?text=Video+Download+${videoId}`,
          instructions: 'Use the downloadUrl to fetch the video file'
        },
        { status: 200 }
      );
    }

    // Default: Return video management info
    return NextResponse.json(
      { 
        message: 'Video management API is active',
        endpoints: {
          download: '/api/videos?action=download&id=VIDEO_ID',
          list: 'Use client-side storage for video list management',
          delete: 'Use client-side storage for video deletion'
        },
        description: 'Manage generated videos',
        note: 'This API primarily handles server-side operations like downloads. Video metadata is managed client-side for better performance.'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Video management API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Video management operation failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required for deletion' },
        { status: 400 }
      );
    }

    // In a real implementation, this would delete the video file from storage
    // For this demo, we'll just return success
    return NextResponse.json(
      { 
        message: 'Video deletion processed',
        videoId,
        note: 'Video metadata should be removed from client-side storage'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Video deletion API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Video deletion failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}