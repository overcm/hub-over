import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { StorageProvider, SavedFile } from "../types";

function basePath() {
  return process.env.MATERIALS_LOCAL_PATH ?? "./storage/materials";
}

export class LocalDiskStorageProvider implements StorageProvider {
  name = "local-disk";

  async save(params: { buffer: Buffer; fileName: string; folder: string }): Promise<SavedFile> {
    const dir = path.join(basePath(), params.folder);
    await mkdir(dir, { recursive: true });

    const ext = path.extname(params.fileName);
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(dir, uniqueName);

    await writeFile(filePath, params.buffer);

    return {
      fileUrl: `/api/materials/${params.folder}/${uniqueName}`,
      fileSizeBytes: params.buffer.byteLength,
    };
  }

  async delete(fileUrl: string): Promise<void> {
    const relative = fileUrl.replace(/^\/api\/materials\//, "");
    const filePath = path.join(basePath(), relative);
    await unlink(filePath).catch(() => {});
  }
}
