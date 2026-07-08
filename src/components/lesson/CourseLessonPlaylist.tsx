import Link from "next/link";
import { CheckCircle2, PlayCircle, Circle, Clock } from "lucide-react";

export interface PlaylistLesson {
  id: string;
  title: string;
  slug: string;
  moduleTitle: string;
  completed: boolean;
  isCurrent: boolean;
  comingSoon: boolean;
}

export function CourseLessonPlaylist({
  courseSlug,
  lessons,
}: {
  courseSlug: string;
  lessons: PlaylistLesson[];
}) {
  if (lessons.length === 0) return null;

  let lastModule: string | null = null;

  return (
    <div className="max-h-[420px] space-y-1 overflow-y-auto rounded-lg border p-2">
      {lessons.map((lesson) => {
        const showModuleHeading = lesson.moduleTitle !== lastModule;
        lastModule = lesson.moduleTitle;

        return (
          <div key={lesson.id}>
            {showModuleHeading && (
              <p className="mt-2 mb-1 px-1 text-xs font-medium text-muted-foreground first:mt-0">
                {lesson.moduleTitle}
              </p>
            )}
            {lesson.comingSoon ? (
              <div className="flex cursor-not-allowed items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground opacity-60">
                <Clock size={16} className="shrink-0" />
                <span className="truncate">{lesson.title}</span>
                <span className="ml-auto shrink-0 text-xs">Em breve</span>
              </div>
            ) : (
              <Link
                href={`/cursos/${courseSlug}/aulas/${lesson.slug}`}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted ${
                  lesson.isCurrent ? "bg-muted font-medium" : ""
                }`}
              >
                {lesson.completed ? (
                  <CheckCircle2 size={16} className="shrink-0 text-primary" />
                ) : lesson.isCurrent ? (
                  <PlayCircle size={16} className="shrink-0 text-foreground" />
                ) : (
                  <Circle size={16} className="shrink-0 text-muted-foreground" />
                )}
                <span className="truncate">{lesson.title}</span>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
