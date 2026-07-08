import type { VideoStorageProvider } from "./types";
import { BunnyStreamProvider } from "./providers/bunny-stream.provider";
import { LocalDiskVideoProvider } from "./providers/local-disk.provider";

export function getVideoProvider(name?: string | null): VideoStorageProvider {
  const provider = name ?? process.env.VIDEO_PROVIDER ?? "local";
  if (provider === "bunny") return new BunnyStreamProvider();
  return new LocalDiskVideoProvider();
}

export * from "./types";
