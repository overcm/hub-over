"use client";

import Link from "next/link";
import { ArrowRight, Clock, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CourseLessonPlaylist, type PlaylistLesson } from "./CourseLessonPlaylist";

interface NextLesson {
  slug: string;
  title: string;
  comingSoon: boolean;
}

export function LessonNavigation({
  courseSlug,
  nextLesson,
  lessons,
}: {
  courseSlug: string;
  nextLesson: NextLesson | null;
  lessons: PlaylistLesson[];
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {nextLesson ? (
        nextLesson.comingSoon ? (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={16} />
            Próxima aula em breve
          </span>
        ) : (
          <Button
            render={
              <Link href={`/cursos/${courseSlug}/aulas/${nextLesson.slug}`}>
                <span className="truncate">Próxima aula: {nextLesson.title}</span>
                <ArrowRight size={16} />
              </Link>
            }
            nativeButton={false}
            variant="outline"
            className="flex max-w-full items-center gap-2"
          />
        )
      ) : (
        <span className="text-sm text-muted-foreground">Você chegou na última aula.</span>
      )}

      {lessons.length > 1 && (
        <Dialog>
          <DialogTrigger render={<Button variant="ghost" className="flex items-center gap-2" />}>
            <List size={16} />
            Ver todas as aulas
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] max-w-md overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Aulas do conteúdo</DialogTitle>
            </DialogHeader>
            <CourseLessonPlaylist courseSlug={courseSlug} lessons={lessons} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
