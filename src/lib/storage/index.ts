import type { StorageProvider } from "./types";
import { LocalDiskStorageProvider } from "./providers/local-disk.provider";

export function getStorageProvider(): StorageProvider {
  return new LocalDiskStorageProvider();
}

export * from "./types";
