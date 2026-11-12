"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { BookOpen, Forklift, LayoutDashboard, LogOut, Sparkles, User, type LucideIcon } from "lucide-react";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "ภาพรวมงาน", icon: LayoutDashboard },
  { href: "/dashboard/knowledge", label: "คลังความรู้", icon: BookOpen },
  { href: "/dashboard/ai", label: "AI ช่วยงาน", icon: Sparkles },
];

const handleLogout = () => signOut({ callbackUrl: "/login" });

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href || pathname.startsWith("/dashboard/new");
  return pathname.startsWith(href);
}

type Props = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  /** true = เนื้อหาเต็มพื้นที่ ไม่มี padding (ใช้กับหน้าแชท) */
  flush?: boolean;
  children: ReactNode;
};

export function AppShell({ title, subtitle, actions, flush, children }: Props) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex h-dvh overflow-hidden">
      <aside className="hidden w-64 shrink-0 flex-col bg-ink text-white md:flex">
        <Link href="/dashboard" className="flex items-center gap-3 px-5 py-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-hazard text-ink">
            <Forklift size={24} strokeWidth={2} />
          </span>
          <span className="font-display text-xl font-semibold tracking-wide">Service Hub</span>
        </Link>
        <div className="stripes h-1.5" aria-hidden="true" />

        <nav className="flex-1 space-y-1 p-3 pt-5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span
                  className={`absolute left-0 top-1/2 w-1 -translate-y-1/2 rounded-r bg-hazard transition-all duration-300 ${
                    active ? "h-6 opacity-100" : "h-0 opacity-0"
                  }`}
                />
                <Icon size={19} className={`transition ${active ? "text-hazard" : "group-hover:translate-x-0.5"}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-white/10 p-3">
          <div className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400">
            <User size={17} className="shrink-0" />
            <span className="truncate">{session?.user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={19} /> ออกจากระบบ
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between bg-ink px-4 py-3 text-white md:hidden">
          <span className="flex items-center gap-2 font-display text-lg font-semibold">
            <Forklift size={22} className="text-hazard" /> Service Hub
          </span>
          <button onClick={handleLogout} aria-label="ออกจากระบบ" className="rounded-lg p-2 text-slate-300 hover:bg-white/10">
            <LogOut size={19} />
          </button>
        </div>

        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper px-4 py-4 md:px-8">
          <div className="min-w-0">
            <h1 className="font-display text-xl font-semibold leading-tight md:text-2xl">{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {actions}
        </header>

        <main className="relative min-h-0 flex-1 overflow-y-auto">
          {flush ? (
            <div className="absolute inset-0">{children}</div>
          ) : (
            <div className="mx-auto w-full max-w-6xl p-4 md:p-8">{children}</div>
          )}
        </main>

        <nav className="grid grid-cols-3 border-t border-line bg-paper md:hidden">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition ${
                  active ? "text-ink" : "text-slate-500"
                }`}
              >
                <span className={`rounded-full px-4 py-1 transition ${active ? "bg-hazard" : ""}`}>
                  <Icon size={19} />
                </span>
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
