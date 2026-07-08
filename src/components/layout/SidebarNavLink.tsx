"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarNavLink({
  href,
  label,
  icon: Icon,
  exact = false,
  newTab = false,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  newTab?: boolean;
}) {
  const pathname = usePathname();
  const isActive = !newTab && (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-accent text-white"
          : "text-white/60 hover:bg-sidebar-accent hover:text-white",
      )}
    >
      <span className={cn("h-1 w-1 rounded-full", isActive ? "bg-primary" : "bg-transparent")} />
      <Icon size={16} />
      {label}
    </Link>
  );
}
