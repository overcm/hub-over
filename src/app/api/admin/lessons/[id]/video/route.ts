import { NextRequest, NextResponse } from "next/server";
import { mkdir, unlink } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import crypto from "node:crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { videosBasePath } from "@/lib/video/providers/local-disk.provider";
import { getVideoProvider } from "@/lib/video";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const fileName = req.nextUrl.searchParams.get("filename") ?? "video.mp4";
  const durationSec = req.nextUrl.searchParams.get("duration");

  if (!req.body) {
    return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.startsWith("video/")) {
    return NextResponse.json({ error: "O arquivo precisa ser um vídeo" }, { status: 400 });
  }

  if (lesson.videoProvider === "local" && lesson.videoAssetId) {
    await unlink(path.join(videosBasePath(), lesson.videoAssetId)).catch(() => {});
  }

  const dir = path.join(videosBasePath(), lessonId);
  await mkdir(dir, { recursive: true });

  const ext = path.extname(fileName) || ".mp4";
  const uniqueName = `${crypto.randomUUID()}${ext}`;
  const assetId = `${lessonId}/${uniqueName}`;
  const destPath = path.join(dir, uniqueName);

  try {
    await pipeline(Readable.fromWeb(req.body as import("stream/web").ReadableStream), createWriteStream(destPath));
  } catch (error) {
    await unlink(destPath).catch(() => {});
    console.error("[video upload] falha ao gravar arquivo:", error);
    return NextResponse.json({ error: "Falha ao salvar o vídeo no servidor" }, { status: 500 });
  }

  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      videoProvider: "local",
      videoAssetId: assetId,
      videoFileName: fileName,
      videoStatus: "READY",
      durationSec: durationSec ? Math.round(Number(durationSec)) : null,
    },
  });

  return NextResponse.json({ ok: true, assetId });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: lessonId } = await params;
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (lesson.videoAssetId) {
    const provider = getVideoProvider(lesson.videoProvider);
    await provider.deleteVideo(lesson.videoAssetId).catch(() => {});
  }

  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      videoProvider: null,
      videoAssetId: null,
      videoFileName: null,
      videoStatus: "PENDING",
      durationSec: null,
    },
  });

  return NextResponse.json({ ok: true });
}
