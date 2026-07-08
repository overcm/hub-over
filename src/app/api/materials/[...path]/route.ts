import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".zip": "application/zip",
  ".txt": "text/plain",
};

export async function GET(
  _req: NextRequest,
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

  const basePath = process.env.MATERIALS_LOCAL_PATH ?? "./storage/materials";
  const filePath = path.join(basePath, lessonId, fileName);

  try {
    const buffer = await readFile(filePath);
    const ext = path.extname(fileName).toLowerCase();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
