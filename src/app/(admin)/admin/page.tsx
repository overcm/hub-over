import { BookOpen, Users, PlayCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [courseCount, studentCount, lessonCount] = await Promise.all([
    prisma.course.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.lesson.count(),
  ]);

  const stats = [
    { label: "Conteúdos", value: courseCount, icon: BookOpen },
    { label: "Alunos", value: studentCount, icon: Users },
    { label: "Aulas", value: lessonCount, icon: PlayCircle },
  ];

  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Visão geral</p>
      <h1 className="mt-1 mb-8 text-3xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-black text-primary">
              <Icon size={20} />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
