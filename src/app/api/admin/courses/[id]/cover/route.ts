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

  const { id: courseId } = await params;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

  await deleteImage(course.coverImageUrl);
  const coverImageUrl = await saveImage(buffer, fileName, `courses/${courseId}`);
  const focalPoint = await computeFocalPoint(buffer);

  await prisma.course.update({
    where: { id: courseId },
    data: { coverImageUrl, coverFocalX: focalPoint.x, coverFocalY: focalPoint.y },
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, coverImageUrl, focalPoint });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: courseId } = await params;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { x, y } = await req.json();
  if (typeof x !== "number" || typeof y !== "number") {
    return NextResponse.json({ error: "Ponto focal inválido" }, { status: 400 });
  }

  const coverFocalX = Math.min(1, Math.max(0, x));
  const coverFocalY = Math.min(1, Math.max(0, y));

  await prisma.course.update({ where: { id: courseId }, data: { coverFocalX, coverFocalY } });

  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, focalPoint: { x: coverFocalX, y: coverFocalY } });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: courseId } = await params;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteImage(course.coverImageUrl);
  await prisma.course.update({
    where: { id: courseId },
    data: { coverImageUrl: null, coverFocalX: null, coverFocalY: null },
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true });
}
