import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/lib/auth";
import { bunnyGet } from "@/lib/bunny-storage-client";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path: segments } = await params;
  if (segments.length < 2) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = path.extname(segments[segments.length - 1]).toLowerCase();

  if (process.env.STORAGE_PROVIDER === "bunny") {
    const buffer = await bunnyGet(`images/${segments.join("/")}`);
    if (!buffer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=86400",
      },
    });
  }

  const basePath = process.env.IMAGES_LOCAL_PATH ?? "./storage/images";
  const filePath = path.join(basePath, ...segments);

  try {
    const buffer = await readFile(filePath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
