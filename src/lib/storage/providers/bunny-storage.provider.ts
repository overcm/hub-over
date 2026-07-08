import crypto from "node:crypto";
import path from "node:path";
import type { StorageProvider, SavedFile } from "../types";
import { bunnyPut, bunnyDelete } from "@/lib/bunny-storage-client";

export class BunnyStorageProvider implements StorageProvider {
  name = "bunny";

  async save(params: { buffer: Buffer; fileName: string; folder: string }): Promise<SavedFile> {
    const ext = path.extname(params.fileName);
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    const remotePath = `${params.folder}/${uniqueName}`;

    await bunnyPut(remotePath, params.buffer);

    return {
      fileUrl: `/api/materials/${remotePath}`,
      fileSizeBytes: params.buffer.byteLength,
    };
  }

  async delete(fileUrl: string): Promise<void> {
    const relative = fileUrl.replace(/^\/api\/materials\//, "");
    await bunnyDelete(relative);
  }
}
