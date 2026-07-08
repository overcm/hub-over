import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: lessonId } = await params;
  const comments = await prisma.lessonComment.findMany({
    where: { lessonId, deletedAt: null },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: lessonId } = await params;
  const { content, parentId } = await req.json();

  if (typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Conteúdo obrigatório" }, { status: 400 });
  }

  const comment = await prisma.lessonComment.create({
    data: {
      lessonId,
      userId: session.user.id,
      content: content.trim(),
      parentId: typeof parentId === "string" ? parentId : null,
    },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json({ comment });
}
