"use client";

import { GraduationCap, User, Users } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function StudentSidebar({ userName }: { userName: string }) {
  return (
    <Sidebar
      userName={userName}
      navItems={[
        { href: "/inicio", label: "Meus conteúdos", icon: GraduationCap, exact: true },
        { href: "/comunidade", label: "Comunidade", icon: Users },
        { href: "/perfil", label: "Meu perfil", icon: User },
      ]}
    />
  );
}
