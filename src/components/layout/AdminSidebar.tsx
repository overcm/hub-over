"use client";

import { LayoutDashboard, BookOpen, Users, Users2, CalendarPlus, User, ArrowLeftRight } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function AdminSidebar({ userName }: { userName: string }) {
  return (
    <Sidebar
      userName={userName}
      eyebrow="Admin"
      navItems={[
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
        { href: "/admin/cursos", label: "Conteúdos", icon: BookOpen },
        { href: "/admin/alunos", label: "Alunos", icon: Users },
        { href: "/admin/comunidade", label: "Comunidade", icon: Users2 },
        { href: "/admin/mentoria", label: "Marcar mentoria", icon: CalendarPlus },
        { href: "/perfil", label: "Meu perfil", icon: User },
        { href: "/", label: "Ver área do aluno", icon: ArrowLeftRight, newTab: true },
      ]}
    />
  );
}
