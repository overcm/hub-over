import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: lessonId } = await params;
  const notes = await prisma.lessonNote.findMany({
    where: { lessonId, userId: session.user.id },
    orderBy: { timestampSec: "asc" },
  });

  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: lessonId } = await params;
  const { content, timestampSec } = await req.json();

  if (typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Conteúdo obrigatório" }, { status: 400 });
  }

  const note = await prisma.lessonNote.create({
    data: {
      lessonId,
      userId: session.user.id,
      content: content.trim(),
      timestampSec: typeof timestampSec === "number" ? Math.floor(timestampSec) : null,
    },
  });

  return NextResponse.json({ note });
}
