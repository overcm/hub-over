import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const fileName = req.nextUrl.searchParams.get("filename");
  if (!fileName) {
    return NextResponse.json({ error: "Nome do arquivo obrigatório" }, { status: 400 });
  }

  if (!req.body) {
    return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });
  }

  const contentType = req.headers.get("content-type") ?? "application/octet-stream";
  const buffer = Buffer.from(await req.arrayBuffer());

  if (buffer.byteLength === 0) {
    return NextResponse.json({ error: "Arquivo vazio" }, { status: 400 });
  }

  const storage = getStorageProvider();
  const saved = await storage.save({ buffer, fileName, folder: lessonId });

  const material = await prisma.lessonMaterial.create({
    data: {
      lessonId,
      title: fileName,
      fileUrl: saved.fileUrl,
      fileType: contentType,
      fileSizeBytes: saved.fileSizeBytes,
    },
  });

  return NextResponse.json({ ok: true, material });
}
