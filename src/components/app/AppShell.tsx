"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { me } from "@/lib/data";
import { Icon, type IconName } from "../Icons";
import { useStore } from "./DemoStore";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationsBell } from "./NotificationsBell";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { Avatar } from "./ui";

type NavItem = { href: string; label: string; icon: IconName };

const GROUPS: { label?: string; items: NavItem[] }[] = [
  {
    items: [{ href: "/dashboard", label: "Dashboard", icon: "grid" }],
  },
  {
    label: "Safety",
    items: [
      { href: "/dashboard/swms", label: "SWMS", icon: "file" },
      { href: "/dashboard/risks", label: "Risk register", icon: "alert" },
      { href: "/dashboard/toolbox", label: "Toolbox talks", icon: "users" },
      {
        href: "/dashboard/inspections",
        label: "Inspections",
        icon: "clipboard",
      },
      { href: "/dashboard/incidents", label: "Incidents", icon: "shield" },
      { href: "/dashboard/actions", label: "Actions", icon: "check" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/dashboard/people", label: "Workers and tickets", icon: "id" },
      {
        href: "/dashboard/subcontractors",
        label: "Subcontractors",
        icon: "store",
      },
    ],
  },
  {
    label: "Business",
    items: [
      { href: "/dashboard/projects", label: "Projects", icon: "building" },
      { href: "/dashboard/audit", label: "Audit log", icon: "clock" },
    ],
  },
];

const ALL_ITEMS = GROUPS.flatMap((g) => g.items);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { resetDemo, settings } = useStore();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);
  const current = ALL_ITEMS.find((n) => isActive(n.href));
  const inSettings = pathname.startsWith("/dashboard/settings");

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link
        href="/dashboard"
        className="flex h-16 shrink-0 items-center px-5"
        onClick={() => setOpen(false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="WHSCOMPLY"
          width={427}
          height={63}
          className="h-6 w-auto"
        />
      </Link>

      <div className="mx-3 shrink-0 rounded-xl border border-line bg-surface px-3 py-2.5">
        <p className="truncate text-sm font-bold">{settings.company.name}</p>
        <p className="text-xs text-ink-soft">Demo workspace</p>
      </div>

      <nav
        aria-label="App"
        className="mt-4 flex-1 space-y-4 overflow-y-auto px-3 pb-3"
      >
        {GROUPS.map((g, gi) => (
          <div key={gi}>
            {g.label && (
              <p className="px-3 pb-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                {g.label}
              </p>
            )}
            <div className="space-y-0.5">
              {g.items.map((n) => {
                const active = n === current;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-accent/20 text-ink"
                        : "text-ink-soft hover:bg-tint hover:text-ink"
                    }`}
                  >
                    <Icon name={n.icon} className="h-[18px] w-[18px]" />
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="m-3 shrink-0 rounded-xl border border-line bg-surface p-3">
        <div className="flex items-center gap-3">
          <Avatar initials={me.initials} tone={0} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{me.name}</p>
            <p className="truncate text-xs text-ink-soft">{me.role}</p>
          </div>
        </div>
        <Link
          href="/"
          className="mt-3 flex items-center gap-2 text-xs font-semibold text-ink-soft hover:text-ink"
        >
          <Icon name="logout" className="h-3.5 w-3.5" /> Sign out
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg text-ink lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-bg lg:block">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-bg shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-8">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg lg:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" className="h-6 w-6" />
          </button>
          <ProjectSwitcher />
          <GlobalSearch />
          <span className="ml-auto flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full bg-tint px-3 py-1 text-[11px] font-semibold text-ink-soft xl:inline">
              Sample data
            </span>
            <NotificationsBell />
            <Link
              href="/dashboard/settings"
              aria-label="Settings"
              aria-current={inSettings ? "page" : undefined}
              className={`flex h-10 w-10 items-center justify-center rounded-full hover:bg-tint ${
                inSettings ? "bg-accent/20" : ""
              }`}
            >
              <Icon name="settings" className="h-5 w-5" />
            </Link>
            <span className="hidden sm:block">
              <Avatar initials={me.initials} tone={0} />
            </span>
          </span>
        </header>

        <div className="border-b border-line bg-tint/60 px-4 py-2 text-center text-xs text-ink-soft sm:px-8">
          You are viewing a demo workspace with sample data. Changes are saved
          in this browser only.{" "}
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm("Reset the demo workspace to its starting data?")
              )
                resetDemo();
            }}
            className="font-semibold underline"
          >
            Reset demo
          </button>
        </div>

        <div className="mx-auto max-w-6xl p-4 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
