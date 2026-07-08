import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

function basePath() {
  return process.env.IMAGES_LOCAL_PATH ?? "./storage/images";
}

export async function saveImage(buffer: Buffer, fileName: string, folder: string): Promise<string> {
  const dir = path.join(basePath(), folder);
  await mkdir(dir, { recursive: true });

  const ext = path.extname(fileName) || ".jpg";
  const uniqueName = `${crypto.randomUUID()}${ext}`;
  await writeFile(path.join(dir, uniqueName), buffer);

  return `/api/images/${folder}/${uniqueName}`;
}

export async function deleteImage(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const relative = url.replace(/^\/api\/images\//, "");
  await unlink(path.join(basePath(), relative)).catch(() => {});
}
