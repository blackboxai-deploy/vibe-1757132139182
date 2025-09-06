import { Video, VideoSettings, GenerationStats } from '@/types/video';

const STORAGE_KEYS = {
  VIDEOS: 'ai_video_app_videos',
  SETTINGS: 'ai_video_app_settings',
  STATS: 'ai_video_app_stats'
};

export class VideoStorage {
  // Video Management
  static getVideos(): Video[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading videos:', error);
      return [];
    }
  }

  static saveVideo(video: Video): void {
    if (typeof window === 'undefined') return;
    
    try {
      const videos = this.getVideos();
      const existingIndex = videos.findIndex(v => v.id === video.id);
      
      if (existingIndex >= 0) {
        videos[existingIndex] = video;
      } else {
        videos.unshift(video); // Add new videos to the beginning
      }
      
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
      this.updateStats(video);
    } catch (error) {
      console.error('Error saving video:', error);
    }
  }

  static deleteVideo(videoId: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const videos = this.getVideos();
      const filteredVideos = videos.filter(v => v.id !== videoId);
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(filteredVideos));
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  }

  static getVideo(videoId: string): Video | null {
    const videos = this.getVideos();
    return videos.find(v => v.id === videoId) || null;
  }

  // Settings Management
  static getSettings(): VideoSettings {
    if (typeof window === 'undefined') {
      return this.getDefaultSettings();
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? { ...this.getDefaultSettings(), ...JSON.parse(stored) } : this.getDefaultSettings();
    } catch (error) {
      console.error('Error loading settings:', error);
      return this.getDefaultSettings();
    }
  }

  static saveSettings(settings: Partial<VideoSettings>): void {
    if (typeof window === 'undefined') return;
    
    try {
      const currentSettings = this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  private static getDefaultSettings(): VideoSettings {
    return {
      systemPrompt: `You are an expert video generation assistant. Generate high-quality videos based on user prompts. 

Guidelines:
- Create visually compelling and coherent video content
- Ensure smooth transitions and professional quality
- Follow the specified duration, aspect ratio, and style requirements
- Generate content that is appropriate and engaging
- Focus on visual storytelling and cinematic quality

Respond only with the video generation request, no additional text.`,
      defaultDuration: 5,
      defaultAspectRatio: 'landscape',
      defaultQuality: 'standard',
      maxConcurrentGenerations: 3,
      autoDownload: false
    };
  }

  // Statistics Management
  static getStats(): GenerationStats {
    if (typeof window === 'undefined') {
      return this.getDefaultStats();
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STATS);
      return stored ? JSON.parse(stored) : this.getDefaultStats();
    } catch (error) {
      console.error('Error loading stats:', error);
      return this.getDefaultStats();
    }
  }

  private static updateStats(video: Video): void {
    if (typeof window === 'undefined') return;
    
    try {
      const videos = this.getVideos();
      
      // Calculate updated stats
      const completedVideos = videos.filter(v => v.status === 'completed');
      const totalVideos = videos.length;
      
      const updatedStats: GenerationStats = {
        totalGenerated: totalVideos,
        totalProcessingTime: this.calculateTotalProcessingTime(videos),
        successRate: totalVideos > 0 ? (completedVideos.length / totalVideos) * 100 : 0,
        storageUsed: this.calculateStorageUsed(videos),
        lastGenerated: video.createdAt
      };
      
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updatedStats));
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  private static getDefaultStats(): GenerationStats {
    return {
      totalGenerated: 0,
      totalProcessingTime: 0,
      successRate: 0,
      storageUsed: 0
    };
  }

  private static calculateTotalProcessingTime(videos: Video[]): number {
    return videos.reduce((total, video) => {
      if (video.completedAt && video.createdAt) {
        const processingTime = new Date(video.completedAt).getTime() - new Date(video.createdAt).getTime();
        return total + Math.max(0, processingTime / 1000); // Convert to seconds
      }
      return total;
    }, 0);
  }

  private static calculateStorageUsed(videos: Video[]): number {
    return videos.reduce((total, video) => {
      return total + (video.fileSize || 0);
    }, 0);
  }

  // Utility Methods
  static clearAllData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.VIDEOS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.STATS);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  static exportData(): string {
    const data = {
      videos: this.getVideos(),
      settings: this.getSettings(),
      stats: this.getStats(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.videos) {
        localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(data.videos));
      }
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      if (data.stats) {
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(data.stats));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}