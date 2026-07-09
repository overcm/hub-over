import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireEnrollment } from "@/lib/permissions";
import { getVideoProvider } from "@/lib/video";
import { computeHeatmap } from "@/lib/heatmap";
import { LessonPlayerSection } from "@/components/lesson/LessonPlayerContext";
import { LessonTabs } from "@/components/lesson/LessonTabs";
import { RatingStars } from "@/components/lesson/RatingStars";
import { MarkCompleteButton } from "@/components/lesson/MarkCompleteButton";
import { type PlaylistLesson } from "@/components/lesson/CourseLessonPlaylist";
import { LessonNavigation } from "@/components/lesson/LessonNavigation";
import { BackLink } from "@/components/layout/BackLink";

export default async function StudentLessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, lessonSlug } = await params;

  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) notFound();

  const user = await requireEnrollment(course.id);

  const lesson = await prisma.lesson.findFirst({
    where: { slug: lessonSlug, module: { courseId: course.id } },
    include: {
      chapters: { orderBy: { startSec: "asc" } },
      materials: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!lesson) notFound();

  const progress = await prisma.lessonProgress.findUnique({
    where: { lessonId_userId: { lessonId: lesson.id, userId: user.id } },
  });

  let playback: { url: string; type: "hls" | "mp4"; thumbnailUrl?: string } | null = null;
  if (lesson.videoStatus === "READY" && lesson.videoAssetId) {
    const provider = getVideoProvider(lesson.videoProvider);
    playback = await provider.getPlaybackUrl(lesson.videoAssetId);
  }

  const allProgress = await prisma.lessonProgress.findMany({
    where: { lessonId: lesson.id },
    select: { watchedBuckets: true },
  });
  const heatmap = computeHeatmap(allProgress.map((p) => p.watchedBuckets));

  const courseModules = await prisma.module.findMany({
    where: { courseId: course.id },
    orderBy: { order: "asc" },
    include: { lessons: { where: { published: true }, orderBy: { order: "asc" } } },
  });

  const courseLessonIds = courseModules.flatMap((m) => m.lessons.map((l) => l.id));
  const courseProgress = await prisma.lessonProgress.findMany({
    where: { lessonId: { in: courseLessonIds }, userId: user.id },
    select: { lessonId: true, completed: true },
  });
  const completedByLessonId = new Map(courseProgress.map((p) => [p.lessonId, p.completed]));

  const playlistLessons: PlaylistLesson[] = courseModules.flatMap((module) =>
    module.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      moduleTitle: module.title,
      completed: completedByLessonId.get(l.id) ?? false,
      isCurrent: l.id === lesson.id,
      comingSoon: module.comingSoon || l.comingSoon,
    })),
  );

  const currentIndex = playlistLessons.findIndex((l) => l.isCurrent);
  const nextPlaylistLesson =
    currentIndex >= 0 ? playlistLessons[currentIndex + 1] : undefined;
  const nextLesson = nextPlaylistLesson
    ? {
        slug: nextPlaylistLesson.slug,
        title: nextPlaylistLesson.title,
        comingSoon: nextPlaylistLesson.comingSoon,
      }
    : null;

  return (
    <div className="space-y-6">
      <div>
        <BackLink href={`/cursos/${course.slug}`} label="Voltar para o conteúdo" />
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">Aula</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{lesson.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <RatingStars lessonId={lesson.id} />
          <MarkCompleteButton lessonId={lesson.id} initialCompleted={progress?.completed ?? false} />
        </div>
      </div>

      {playback ? (
        <LessonPlayerSection
          lessonId={lesson.id}
          src={playback.url}
          type={playback.type}
          poster={playback.thumbnailUrl ?? lesson.thumbnailUrl ?? undefined}
          chapters={lesson.chapters}
          initialPositionSec={progress?.lastPositionSec}
          heatmap={heatmap}
        />
      ) : (
        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(199,40,37,0.25),_transparent_60%)]" />
          <div className="relative flex flex-col items-center gap-2 text-white/50">
            <Clock size={28} />
            <p className="text-sm">Vídeo ainda não disponível</p>
          </div>
        </div>
      )}

      <LessonNavigation courseSlug={course.slug} nextLesson={nextLesson} lessons={playlistLessons} />

      <LessonTabs
        lessonId={lesson.id}
        description={lesson.description}
        materials={lesson.materials}
      />
    </div>
  );
}
