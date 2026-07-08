import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: lessonId } = await params;
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { durationSec } = await req.json().catch(() => ({ durationSec: undefined }));

  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      videoStatus: "PROCESSING",
      ...(durationSec ? { durationSec: Math.round(Number(durationSec)) } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
