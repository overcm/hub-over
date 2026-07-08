import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveImage, deleteImage } from "@/lib/images";
import { computeFocalPoint } from "@/lib/smart-crop";

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

  await deleteImage(lesson.thumbnailUrl);
  const thumbnailUrl = await saveImage(buffer, fileName, `lessons/${lessonId}`);
  const focalPoint = await computeFocalPoint(buffer);

  await prisma.lesson.update({
    where: { id: lessonId },
    data: { thumbnailUrl, thumbnailFocalX: focalPoint.x, thumbnailFocalY: focalPoint.y },
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, thumbnailUrl, focalPoint });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { x, y } = await req.json();
  if (typeof x !== "number" || typeof y !== "number") {
    return NextResponse.json({ error: "Ponto focal inválido" }, { status: 400 });
  }

  const thumbnailFocalX = Math.min(1, Math.max(0, x));
  const thumbnailFocalY = Math.min(1, Math.max(0, y));

  await prisma.lesson.update({
    where: { id: lessonId },
    data: { thumbnailFocalX, thumbnailFocalY },
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, focalPoint: { x: thumbnailFocalX, y: thumbnailFocalY } });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteImage(lesson.thumbnailUrl);
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { thumbnailUrl: null, thumbnailFocalX: null, thumbnailFocalY: null },
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true });
}
