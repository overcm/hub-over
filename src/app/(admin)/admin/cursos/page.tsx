import Link from "next/link";
import { Plus, BookOpen, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { focalPointToObjectPosition } from "@/lib/focal-point";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { modules: true, enrollments: true } } },
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">Conteúdo</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Conteúdos</h1>
        </div>
        <Button
          render={<Link href="/admin/cursos/novo"><Plus size={16} />Novo conteúdo</Link>}
          nativeButton={false}
          className="flex items-center gap-1.5"
        />
      </div>

      {courses.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum conteúdo criado ainda.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/admin/cursos/${course.id}`}
              className="group overflow-hidden rounded-xl border border-border transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-black">
                {course.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.coverImageUrl}
                    alt={course.title}
                    style={{ objectPosition: focalPointToObjectPosition(course.coverFocalX, course.coverFocalY) }}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(199,40,37,0.3),_transparent_60%)]" />
                )}
              </div>
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-semibold tracking-tight">{course.title}</h3>
                  <Badge
                    variant={course.published ? "default" : "secondary"}
                    className={course.published ? "bg-primary text-primary-foreground" : ""}
                  >
                    {course.published ? "Publicado" : "Rascunho"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={14} /> {course._count.modules} módulo(s)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={14} /> {course._count.enrollments} aluno(s)
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
