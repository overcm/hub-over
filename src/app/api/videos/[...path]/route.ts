import { NextRequest, NextResponse } from "next/server";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import path from "node:path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { videosBasePath } from "@/lib/video/providers/local-disk.provider";

const MIME_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const [lessonId, fileName] = segments;

  if (!lessonId || !fileName) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { courseId: true } } },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.user.role !== "ADMIN") {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: lesson.module.courseId } },
    });
    if (!enrollment || (enrollment.expiresAt && enrollment.expiresAt < new Date())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const filePath = path.join(videosBasePath(), lessonId, fileName);
  const ext = path.extname(fileName).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  let fileSize: number;
  try {
    fileSize = (await stat(filePath)).size;
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const range = req.headers.get("range");

  if (!range) {
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileSize),
        "Accept-Ranges": "bytes",
      },
    });
  }

  const match = range.match(/bytes=(\d*)-(\d*)/);
  const start = match?.[1] ? parseInt(match[1], 10) : 0;
  const end = match?.[2] ? parseInt(match[2], 10) : fileSize - 1;
  const chunkSize = end - start + 1;

  const stream = Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream;

  return new NextResponse(stream, {
    status: 206,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(chunkSize),
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
    },
  });
}
