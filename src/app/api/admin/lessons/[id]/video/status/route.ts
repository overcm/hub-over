import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getVideoProvider } from "@/lib/video";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: lessonId } = await params;
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!lesson.videoAssetId) {
    return NextResponse.json({ status: lesson.videoStatus });
  }

  try {
    const provider = getVideoProvider(lesson.videoProvider);
    const result = await provider.getStatus(lesson.videoAssetId);

    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        videoStatus: result.status,
        ...(result.durationSec ? { durationSec: Math.round(result.durationSec) } : {}),
      },
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[video status] falha ao consultar status:", err);
    return NextResponse.json({ error: "Falha ao consultar status do vídeo" }, { status: 500 });
  }
}
