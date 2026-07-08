import type { StorageProvider } from "./types";
import { LocalDiskStorageProvider } from "./providers/local-disk.provider";
import { BunnyStorageProvider } from "./providers/bunny-storage.provider";

export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER ?? "local";
  if (provider === "bunny") return new BunnyStorageProvider();
  return new LocalDiskStorageProvider();
}

export * from "./types";
