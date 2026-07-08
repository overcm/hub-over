import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/lib/auth";

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

  const basePath = process.env.IMAGES_LOCAL_PATH ?? "./storage/images";
  const filePath = path.join(basePath, ...segments);

  try {
    const buffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
