"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { VideoGenerationResponse } from '@/types/video';

interface ProgressTrackerProps {
  videoId: string;
  onCompleted: (video: VideoGenerationResponse) => void;
  onError: (error: string) => void;
  pollingInterval?: number;
}

export function ProgressTracker({ 
  videoId, 
  onCompleted, 
  onError, 
  pollingInterval = 3000 
}: ProgressTrackerProps) {
  const [status, setStatus] = useState<VideoGenerationResponse | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/video-status?id=${videoId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to check status');
        }

        const statusData: VideoGenerationResponse = await response.json();
        setStatus(statusData);

        if (statusData.status === 'completed') {
          setIsPolling(false);
          onCompleted(statusData);
        } else if (statusData.status === 'failed') {
          setIsPolling(false);
          onError(statusData.error || 'Video generation failed');
        }
      } catch (error) {
        console.error('Status check error:', error);
        setIsPolling(false);
        onError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    };

    if (isPolling) {
      // Initial check
      checkStatus();
      
      // Set up polling
      intervalId = setInterval(checkStatus, pollingInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [videoId, onCompleted, onError, pollingInterval, isPolling]);

  if (!status) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Initializing...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusMessage = (status: string, progress?: number) => {
    switch (status) {
      case 'pending':
        return 'Queued for processing...';
      case 'processing':
        return progress ? `Generating video... ${Math.round(progress)}% complete` : 'Processing...';
      case 'completed':
        return 'Video generation completed!';
      case 'failed':
        return 'Video generation failed';
      default:
        return 'Unknown status';
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">Generation Progress</span>
          <Badge variant={getStatusColor(status.status) as any}>
            {status.status.toUpperCase()}
          </Badge>
        </CardTitle>
        <CardDescription>
          Video ID: {videoId}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{getStatusMessage(status.status, status.progress)}</span>
            {status.progress !== undefined && (
              <span>{Math.round(status.progress)}%</span>
            )}
          </div>
          <Progress 
            value={status.progress || 0} 
            className="w-full"
          />
        </div>

        {/* Time Information */}
        {status.estimatedTimeRemaining && status.estimatedTimeRemaining > 0 && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Estimated time remaining:</span>
            <span>{formatTime(status.estimatedTimeRemaining)}</span>
          </div>
        )}

        {/* Generation Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Started:</span>
            <div className="font-medium">
              {new Date(status.createdAt).toLocaleTimeString()}
            </div>
          </div>
          {status.completedAt && (
            <div>
              <span className="text-muted-foreground">Completed:</span>
              <div className="font-medium">
                {new Date(status.completedAt).toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>

        {/* Processing Animation */}
        {status.status === 'processing' && (
          <div className="flex items-center justify-center space-x-2 py-2">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Processing your video...</span>
          </div>
        )}

        {/* Error Display */}
        {status.status === 'failed' && status.error && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive text-sm">{status.error}</p>
          </div>
        )}

        {/* Success Message */}
        {status.status === 'completed' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm font-medium">
              🎉 Your video has been generated successfully!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}