import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, PlayCircle, Circle, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireEnrollment } from "@/lib/permissions";
import { BackLink } from "@/components/layout/BackLink";
import { focalPointToObjectPosition } from "@/lib/focal-point";

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { where: { published: true }, orderBy: { order: "asc" } } },
      },
    },
  });

  if (!course) notFound();

  const user = await requireEnrollment(course.id);

  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const progressRows = await prisma.lessonProgress.findMany({
    where: { lessonId: { in: lessonIds }, userId: user.id },
  });
  const progressByLesson = new Map(progressRows.map((p) => [p.lessonId, p]));

  return (
    <div className="space-y-8">
      <div>
        <BackLink href="/inicio" label="Voltar para meus conteúdos" />
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">Conteúdo</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{course.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{course.description}</p>
      </div>

      <div className="space-y-8">
        {course.modules.map((module, moduleIndex) => (
          <div key={module.id} className={module.comingSoon ? "opacity-60 grayscale" : undefined}>
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                {moduleIndex + 1}
              </span>
              <h2 className="text-base font-semibold tracking-tight">{module.title}</h2>
              {module.comingSoon && (
                <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  <Clock size={12} /> Em breve
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {module.lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  courseSlug={course.slug}
                  lesson={lesson}
                  disabled={module.comingSoon || lesson.comingSoon}
                  completed={progressByLesson.get(lesson.id)?.completed ?? false}
                  started={progressByLesson.has(lesson.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LessonCardProps {
  courseSlug: string;
  lesson: {
    slug: string;
    title: string;
    thumbnailUrl: string | null;
    thumbnailFocalX?: number | null;
    thumbnailFocalY?: number | null;
    comingSoon: boolean;
  };
  disabled: boolean;
  completed: boolean;
  started: boolean;
}

function LessonCard({ courseSlug, lesson, disabled, completed, started }: LessonCardProps) {
  const cover = (
    <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-black">
      {lesson.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={lesson.thumbnailUrl}
          alt={lesson.title}
          style={{
            objectPosition: focalPointToObjectPosition(lesson.thumbnailFocalX, lesson.thumbnailFocalY),
          }}
          className={`h-full w-full object-cover ${disabled ? "" : "transition-transform group-hover:scale-105"}`}
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(199,40,37,0.3),_transparent_60%)]" />
          <PlayCircle
            size={32}
            className="relative text-white/25 transition-colors group-hover:text-primary/70"
          />
        </>
      )}
      {disabled ? (
        <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
          <Clock size={12} /> Em breve
        </span>
      ) : (
        completed && (
          <span className="absolute top-2 right-2 flex items-center justify-center rounded-full bg-primary p-1">
            <CheckCircle2 size={14} className="text-primary-foreground" />
          </span>
        )
      )}
    </div>
  );

  const info = (
    <div className="flex items-center gap-2 bg-card p-3">
      {completed ? (
        <CheckCircle2 size={16} className="shrink-0 text-primary" />
      ) : started ? (
        <PlayCircle size={16} className="shrink-0 text-foreground" />
      ) : (
        <Circle size={16} className="shrink-0 text-muted-foreground" />
      )}
      <span className="truncate text-sm font-medium">{lesson.title}</span>
    </div>
  );

  if (disabled) {
    return (
      <div className="group cursor-not-allowed overflow-hidden rounded-xl border border-border opacity-70 grayscale">
        {cover}
        {info}
      </div>
    );
  }

  return (
    <Link
      href={`/cursos/${courseSlug}/aulas/${lesson.slug}`}
      className="group overflow-hidden rounded-xl border border-border transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      {cover}
      {info}
    </Link>
  );
}
