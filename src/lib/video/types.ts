export interface VideoUploadInitResult {
  assetId: string;
  uploadUrl: string;
  uploadMethod: "TUS";
  headers?: Record<string, string>;
}

export interface VideoPlaybackInfo {
  url: string;
  type: "hls" | "mp4";
  thumbnailUrl?: string;
}

export type VideoProcessingStatus = "PROCESSING" | "READY" | "FAILED";

export interface VideoStorageProvider {
  name: string;

  initUpload(params: {
    lessonId: string;
    fileName: string;
    fileSizeBytes: number;
  }): Promise<VideoUploadInitResult>;

  getStatus(assetId: string): Promise<{ status: VideoProcessingStatus; durationSec?: number }>;

  getPlaybackUrl(assetId: string): Promise<VideoPlaybackInfo>;

  deleteVideo(assetId: string): Promise<void>;
}
