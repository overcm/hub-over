import Link from "next/link";
import { GraduationCap, ArrowRight, Clock } from "lucide-react";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { focalPointToObjectPosition } from "@/lib/focal-point";

export default async function StudentHomePage() {
  const user = await requireUser();

  const courses =
    user.role === "ADMIN"
      ? await prisma.course.findMany({ orderBy: { createdAt: "desc" } })
      : (
          await prisma.enrollment.findMany({
            where: {
              userId: user.id,
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
            include: { course: true },
            orderBy: { grantedAt: "desc" },
          })
        ).map((e) => e.course);

  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-primary uppercase">
        Área de membros
      </p>
      <h1 className="mt-1 mb-8 text-3xl font-semibold tracking-tight">Meus conteúdos</h1>

      {user.role === "ADMIN" && (
        <p className="mb-6 text-sm text-muted-foreground">
          Você está vendo todos os conteúdos como administrador (sem precisar de matrícula).
        </p>
      )}

      {courses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Você ainda não tem conteúdos liberados. Fale com o administrador.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

interface CourseCardProps {
  course: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    coverImageUrl: string | null;
    coverFocalX?: number | null;
    coverFocalY?: number | null;
    comingSoon: boolean;
  };
}

function CourseCard({ course }: CourseCardProps) {
  const cover = (
    <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-black">
      {course.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={course.coverImageUrl}
          alt={course.title}
          style={{ objectPosition: focalPointToObjectPosition(course.coverFocalX, course.coverFocalY) }}
          className={`h-full w-full object-cover ${course.comingSoon ? "" : "transition-transform group-hover:scale-105"}`}
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(199,40,37,0.35),_transparent_60%)]" />
          <GraduationCap
            size={40}
            className="relative text-white/25 transition-colors group-hover:text-primary/70"
          />
        </>
      )}
      {course.comingSoon && (
        <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
          <Clock size={12} /> Em breve
        </span>
      )}
    </div>
  );

  const info = (
    <div className="space-y-1.5 bg-card p-4">
      <h3 className="font-semibold tracking-tight">{course.title}</h3>
      <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
      {!course.comingSoon && (
        <span className="inline-flex items-center gap-1 pt-1 text-sm font-medium text-primary">
          Acessar
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      )}
    </div>
  );

  if (course.comingSoon) {
    return (
      <div className="group cursor-not-allowed overflow-hidden rounded-xl border border-border opacity-60 grayscale">
        {cover}
        {info}
      </div>
    );
  }

  return (
    <Link
      href={`/cursos/${course.slug}`}
      className="group overflow-hidden rounded-xl border border-border transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      {cover}
      {info}
    </Link>
  );
}
