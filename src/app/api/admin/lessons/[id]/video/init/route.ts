import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getVideoProvider } from "@/lib/video";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: lessonId } = await params;
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { fileName, fileSizeBytes } = await req.json();
  if (!fileName || !fileSizeBytes) {
    return NextResponse.json({ error: "Dados do arquivo incompletos" }, { status: 400 });
  }

  const provider = getVideoProvider();

  try {
    const result = await provider.initUpload({ lessonId, fileName, fileSizeBytes });

    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        videoProvider: provider.name,
        videoAssetId: result.assetId,
        videoFileName: fileName,
        videoStatus: "UPLOADING",
      },
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[video init] falha ao iniciar upload:", err);
    return NextResponse.json({ error: "Falha ao iniciar upload no provedor de vídeo" }, { status: 500 });
  }
}
