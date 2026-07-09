import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> },
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { noteId } = await params;
  const { content } = await req.json();

  if (typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Conteúdo obrigatório" }, { status: 400 });
  }

  const existing = await prisma.lessonNote.findUnique({ where: { id: noteId } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const note = await prisma.lessonNote.update({
    where: { id: noteId },
    data: { content: content.trim() },
  });

  return NextResponse.json({ note });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> },
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { noteId } = await params;
  const existing = await prisma.lessonNote.findUnique({ where: { id: noteId } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.lessonNote.delete({ where: { id: noteId } });

  return NextResponse.json({ ok: true });
}
