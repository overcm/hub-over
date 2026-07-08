import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: lessonId } = await params;
  const rating = await prisma.lessonRating.findUnique({
    where: { lessonId_userId: { lessonId, userId: session.user.id } },
  });

  return NextResponse.json({ rating });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: lessonId } = await params;
  const { stars, comment } = await req.json();

  if (typeof stars !== "number" || stars < 1 || stars > 5) {
    return NextResponse.json({ error: "Nota inválida" }, { status: 400 });
  }

  const rating = await prisma.lessonRating.upsert({
    where: { lessonId_userId: { lessonId, userId: session.user.id } },
    update: { stars, comment },
    create: { lessonId, userId: session.user.id, stars, comment },
  });

  return NextResponse.json({ rating });
}
