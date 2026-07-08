import { unlink } from "node:fs/promises";
import path from "node:path";
import type { VideoStorageProvider, VideoUploadInitResult, VideoPlaybackInfo } from "../types";

export function videosBasePath() {
  return process.env.VIDEO_LOCAL_PATH ?? "./storage/videos";
}

export class LocalDiskVideoProvider implements VideoStorageProvider {
  name = "local";

  async initUpload(): Promise<VideoUploadInitResult> {
    throw new Error(
      "LocalDiskVideoProvider não usa initUpload — envie o arquivo para /api/admin/lessons/[id]/video",
    );
  }

  async getStatus() {
    return { status: "READY" as const };
  }

  async getPlaybackUrl(assetId: string): Promise<VideoPlaybackInfo> {
    return { url: `/api/videos/${assetId}`, type: "mp4" };
  }

  async deleteVideo(assetId: string): Promise<void> {
    const filePath = path.join(videosBasePath(), assetId);
    await unlink(filePath).catch(() => {});
  }
}
