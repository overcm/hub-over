import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { bunnyPut, bunnyDelete } from "@/lib/bunny-storage-client";

function basePath() {
  return process.env.IMAGES_LOCAL_PATH ?? "./storage/images";
}

function isBunny() {
  return process.env.STORAGE_PROVIDER === "bunny";
}

export async function saveImage(buffer: Buffer, fileName: string, folder: string): Promise<string> {
  const ext = path.extname(fileName) || ".jpg";
  const uniqueName = `${crypto.randomUUID()}${ext}`;

  if (isBunny()) {
    await bunnyPut(`images/${folder}/${uniqueName}`, buffer);
    return `/api/images/${folder}/${uniqueName}`;
  }

  const dir = path.join(basePath(), folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, uniqueName), buffer);

  return `/api/images/${folder}/${uniqueName}`;
}

export async function deleteImage(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const relative = url.replace(/^\/api\/images\//, "");

  if (isBunny()) {
    await bunnyDelete(`images/${relative}`);
    return;
  }

  await unlink(path.join(basePath(), relative)).catch(() => {});
}
