import crypto from "node:crypto";
import type { VideoStorageProvider, VideoUploadInitResult, VideoPlaybackInfo } from "../types";

const BUNNY_API_BASE = "https://video.bunnycdn.com/library";

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ${name} não configurada`);
  return value;
}

// Status codes: https://docs.bunny.net/reference/video_getvideo
function mapBunnyStatus(status: number): "PROCESSING" | "READY" | "FAILED" {
  if (status === 5 || status === 6) return "FAILED";
  if (status === 4) return "READY";
  return "PROCESSING";
}

export class BunnyStreamProvider implements VideoStorageProvider {
  name = "bunny";

  private libraryId() {
    return env("BUNNY_STREAM_LIBRARY_ID");
  }

  private apiKey() {
    return env("BUNNY_STREAM_API_KEY");
  }

  private pullZone() {
    return env("BUNNY_STREAM_PULL_ZONE");
  }

  async initUpload(params: {
    lessonId: string;
    fileName: string;
    fileSizeBytes: number;
  }): Promise<VideoUploadInitResult> {
    const libraryId = this.libraryId();

    const createResponse = await fetch(`${BUNNY_API_BASE}/${libraryId}/videos`, {
      method: "POST",
      headers: {
        AccessKey: this.apiKey(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: params.fileName }),
    });

    if (!createResponse.ok) {
      throw new Error(`Falha ao criar vídeo no Bunny: ${await createResponse.text()}`);
    }

    const { guid: videoId } = await createResponse.json();

    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60; // 1h
    const signature = crypto
      .createHash("sha256")
      .update(`${libraryId}${this.apiKey()}${expiresAt}${videoId}`)
      .digest("hex");

    return {
      assetId: videoId,
      uploadUrl: "https://video.bunnycdn.com/tusupload",
      uploadMethod: "TUS",
      headers: {
        AuthorizationSignature: signature,
        AuthorizationExpire: String(expiresAt),
        VideoId: videoId,
        LibraryId: libraryId,
      },
    };
  }

  async getStatus(assetId: string) {
    const response = await fetch(`${BUNNY_API_BASE}/${this.libraryId()}/videos/${assetId}`, {
      headers: { AccessKey: this.apiKey() },
    });

    if (!response.ok) {
      throw new Error(`Falha ao consultar vídeo no Bunny: ${await response.text()}`);
    }

    const data = await response.json();
    return {
      status: mapBunnyStatus(data.status),
      durationSec: data.length as number | undefined,
    };
  }

  async getPlaybackUrl(assetId: string): Promise<VideoPlaybackInfo> {
    const pullZone = this.pullZone();
    return {
      url: `https://${pullZone}.b-cdn.net/${assetId}/playlist.m3u8`,
      type: "hls",
      thumbnailUrl: `https://${pullZone}.b-cdn.net/${assetId}/thumbnail.jpg`,
    };
  }

  async deleteVideo(assetId: string): Promise<void> {
    const response = await fetch(`${BUNNY_API_BASE}/${this.libraryId()}/videos/${assetId}`, {
      method: "DELETE",
      headers: { AccessKey: this.apiKey() },
    });

    if (!response.ok) {
      throw new Error(`Falha ao remover vídeo no Bunny: ${await response.text()}`);
    }
  }
}
