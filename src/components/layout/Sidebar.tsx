"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { signOutAction } from "@/app/actions";
import { Logo } from "./Logo";
import { SidebarNavLink } from "./SidebarNavLink";

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  newTab?: boolean;
}

export function Sidebar({
  userName,
  eyebrow,
  navItems,
}: {
  userName: string;
  eyebrow?: string;
  navItems: SidebarNavItem[];
}) {
  const [open, setOpen] = useState(false);
  const initial = userName.trim().charAt(0).toUpperCase() || "?";

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-sidebar p-4 lg:hidden">
        <Logo />
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="text-white/80 hover:text-white"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar p-4">
            <div className="mb-8 flex items-center justify-between pt-2">
              <Logo />
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            {eyebrow && (
              <p className="mb-2 -mt-6 pl-4 text-[10px] font-medium tracking-widest text-white/40 uppercase">
                {eyebrow}
              </p>
            )}
            <nav className="flex flex-1 flex-col gap-1" onClick={() => setOpen(false)}>
              {navItems.map((item) => (
                <SidebarNavLink key={item.href} {...item} />
              ))}
            </nav>
            <SidebarFooter userName={userName} initial={initial} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col bg-sidebar p-4 lg:flex">
        <div className="mb-8 px-2 pt-2">
          <Logo />
          {eyebrow && (
            <p className="mt-1 pl-4 text-[10px] font-medium tracking-widest text-white/40 uppercase">
              {eyebrow}
            </p>
          )}
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <SidebarNavLink key={item.href} {...item} />
          ))}
        </nav>
        <SidebarFooter userName={userName} initial={initial} />
      </aside>
    </>
  );
}

function SidebarFooter({ userName, initial }: { userName: string; initial: string }) {
  return (
    <div className="mt-auto space-y-3 border-t border-sidebar-border px-2 pt-4">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initial}
        </span>
        <p className="truncate text-sm text-white/80">{userName}</p>
      </div>
      <form action={signOutAction}>
        <button
          type="submit"
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/50 transition-colors hover:bg-sidebar-accent hover:text-white"
        >
          Sair
        </button>
      </form>
    </div>
  );
}
