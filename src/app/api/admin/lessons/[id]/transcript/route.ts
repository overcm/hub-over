import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

  const buffer = Buffer.from(await req.arrayBuffer());
  if (buffer.byteLength === 0) {
    return NextResponse.json({ error: "Arquivo vazio" }, { status: 400 });
  }

  const storage = getStorageProvider();

  if (lesson.transcriptFileUrl) {
    await storage.delete(lesson.transcriptFileUrl).catch(() => {});
  }

  const saved = await storage.save({ buffer, fileName, folder: lessonId });

  await prisma.lesson.update({
    where: { id: lessonId },
    data: { transcriptFileUrl: saved.fileUrl, transcriptFileName: fileName },
  });

  revalidatePath("/admin", "layout");

  return NextResponse.json({ ok: true, transcriptFileUrl: saved.fileUrl, transcriptFileName: fileName });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (lesson.transcriptFileUrl) {
    const storage = getStorageProvider();
    await storage.delete(lesson.transcriptFileUrl).catch(() => {});
  }

  await prisma.lesson.update({
    where: { id: lessonId },
    data: { transcriptFileUrl: null, transcriptFileName: null },
  });

  revalidatePath("/admin", "layout");

  return NextResponse.json({ ok: true });
}
