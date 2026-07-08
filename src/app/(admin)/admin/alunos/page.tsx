import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export default async function AdminStudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    include: {
      enrollments: {
        include: {
          course: {
            select: {
              title: true,
              modules: { select: { lessons: { where: { published: true }, select: { id: true } } } },
            },
          },
        },
      },
    },
  });

  const completedRows = await prisma.lessonProgress.findMany({
    where: { userId: { in: students.map((s) => s.id) }, completed: true },
    select: { userId: true, lessonId: true },
  });
  const completedByUser = new Map<string, Set<string>>();
  for (const row of completedRows) {
    if (!completedByUser.has(row.userId)) completedByUser.set(row.userId, new Set());
    completedByUser.get(row.userId)!.add(row.lessonId);
  }

  function courseProgress(studentId: string, lessonIds: string[]) {
    if (lessonIds.length === 0) return 0;
    const completed = completedByUser.get(studentId) ?? new Set();
    const done = lessonIds.filter((id) => completed.has(id)).length;
    return Math.round((done / lessonIds.length) * 100);
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">Pessoas</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Alunos</h1>
        </div>
        <Button
          render={
            <Link href="/admin/alunos/novo">
              <Plus size={16} />
              Novo aluno
            </Link>
          }
          nativeButton={false}
          className="flex items-center gap-1.5"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        {students.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">Nenhum aluno cadastrado ainda.</p>
        ) : (
          <div className="divide-y divide-border">
            {students.map((student) => {
              const courses = student.enrollments.map((e) => ({
                title: e.course.title,
                percent: courseProgress(
                  student.id,
                  e.course.modules.flatMap((m) => m.lessons.map((l) => l.id)),
                ),
              }));

              return (
                <Link
                  key={student.id}
                  href={`/admin/alunos/${student.id}`}
                  className="flex items-center gap-3 p-4 transition-colors hover:bg-muted"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                    {student.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                  <div className="ml-auto shrink-0 text-right text-sm text-muted-foreground">
                    {courses.length === 0 ? (
                      <span>Nenhum conteúdo</span>
                    ) : (
                      courses.map((c, i) => (
                        <p key={i} className="truncate">
                          {c.title} — <span className="font-medium text-foreground">{c.percent}%</span>
                        </p>
                      ))
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
