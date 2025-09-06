"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VideoGenerationRequest, VideoGenerationResponse } from '@/types/video';
import { VideoStorage } from '@/lib/video-storage';
import { ProgressTracker } from './ProgressTracker';

interface VideoGeneratorProps {
  onVideoGenerated?: (video: VideoGenerationResponse) => void;
  onVideoStarted?: (videoId: string) => void;
}

export function VideoGenerator({ onVideoGenerated, onVideoStarted }: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState([5]);
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait' | 'square'>('landscape');
  const [quality, setQuality] = useState<'standard' | 'high' | 'premium'>('standard');
  const [style, setStyle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const maxChars = 2000;
  const charCount = prompt.length;

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setError(null);
    setIsGenerating(true);

    try {
      const request: VideoGenerationRequest = {
        prompt: prompt.trim(),
        duration: duration[0],
        aspectRatio,
        quality,
        style: style.trim() || undefined
      };

      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Video generation failed');
      }

      const result: VideoGenerationResponse = await response.json();
      
      // Save video to storage
      VideoStorage.saveVideo({
        id: result.id,
        prompt: request.prompt,
        status: result.status,
        duration: request.duration,
        aspectRatio: request.aspectRatio,
        quality: request.quality,
        style: request.style,
        createdAt: result.createdAt,
        videoUrl: result.videoUrl,
        thumbnailUrl: result.thumbnailUrl
      });

      setCurrentVideoId(result.id);
      onVideoStarted?.(result.id);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsGenerating(false);
      setCurrentVideoId(null);
    }
  };

  const handleVideoCompleted = (video: VideoGenerationResponse) => {
    setIsGenerating(false);
    setCurrentVideoId(null);
    onVideoGenerated?.(video);
    
    // Update video in storage
    const existingVideo = VideoStorage.getVideo(video.id);
    if (existingVideo) {
      VideoStorage.saveVideo({
        ...existingVideo,
        status: video.status,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        completedAt: video.completedAt
      });
    }
  };

  const promptTemplates = [
    "A serene mountain landscape at sunrise with flowing mist",
    "Abstract geometric patterns morphing and transforming",
    "Ocean waves crashing against rocky cliffs in slow motion",
    "Futuristic cityscape with neon lights and flying vehicles",
    "Time-lapse of blooming flowers in a vibrant garden"
  ];

  const aspectRatioOptions = [
    { value: 'landscape', label: 'Landscape (16:9)', desc: 'Widescreen format' },
    { value: 'portrait', label: 'Portrait (9:16)', desc: 'Mobile-friendly' },
    { value: 'square', label: 'Square (1:1)', desc: 'Social media' }
  ];

  const qualityOptions = [
    { value: 'standard', label: 'Standard', desc: 'Fast generation' },
    { value: 'high', label: 'High', desc: 'Better quality' },
    { value: 'premium', label: 'Premium', desc: 'Best quality' }
  ];

  return (
    <div className="space-y-6">
      {/* Main Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            AI Video Generator
            {isGenerating && (
              <Badge variant="secondary" className="animate-pulse">
                Generating...
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Create stunning videos from text descriptions using advanced AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Video Description</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the video you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={maxChars}
              className="min-h-[100px] resize-none"
              disabled={isGenerating}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{charCount}/{maxChars} characters</span>
              {charCount > maxChars * 0.8 && (
                <span className="text-amber-500">Approaching limit</span>
              )}
            </div>
          </div>

          {/* Quick Templates */}
          <div className="space-y-2">
            <Label>Quick Templates</Label>
            <div className="flex flex-wrap gap-2">
              {promptTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(template)}
                  disabled={isGenerating}
                  className="text-xs"
                >
                  {template.slice(0, 30)}...
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Duration */}
            <div className="space-y-3">
              <Label>Duration: {duration[0]} seconds</Label>
              <Slider
                value={duration}
                onValueChange={setDuration}
                max={30}
                min={1}
                step={1}
                disabled={isGenerating}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">
                1-30 seconds
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <Select
                value={aspectRatio}
                onValueChange={(value: 'landscape' | 'portrait' | 'square') => setAspectRatio(value)}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aspectRatioOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.desc}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quality */}
            <div className="space-y-2">
              <Label>Quality</Label>
              <Select
                value={quality}
                onValueChange={(value: 'standard' | 'high' | 'premium') => setQuality(value)}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {qualityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.desc}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Style (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="style">Style (Optional)</Label>
            <Input
              id="style"
              placeholder="e.g., cinematic, anime, photorealistic, watercolor..."
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating || charCount > maxChars}
            className="w-full"
            size="lg"
          >
            {isGenerating ? 'Generating Video...' : 'Generate Video'}
          </Button>
        </CardContent>
      </Card>

      {/* Progress Tracker */}
      {currentVideoId && isGenerating && (
        <ProgressTracker
          videoId={currentVideoId}
          onCompleted={handleVideoCompleted}
          onError={(error) => {
            setError(error);
            setIsGenerating(false);
            setCurrentVideoId(null);
          }}
        />
      )}
    </div>
  );
}