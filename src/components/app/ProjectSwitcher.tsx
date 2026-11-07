"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "../Icons";
import { ALL, useStore } from "./DemoStore";

const STATUS_DOT: Record<string, string> = {
  Live: "bg-accent",
  Starting: "bg-ink-soft",
  Handover: "bg-ink-soft",
  Complete: "bg-line",
};

/** The top-bar project picker. Every page in the dashboard follows this choice. */
export function ProjectSwitcher() {
  const { projects, projectId, setProject, ready } = useStore();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const current = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (id: string) => {
    setProject(id);
    setOpen(false);
  };

  return (
    <div ref={box} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 max-w-[13rem] items-center gap-2 rounded-full border border-line bg-surface pl-3 pr-2.5 text-sm font-semibold hover:bg-tint sm:max-w-[17rem]"
      >
        <Icon name="building" className="h-4 w-4 shrink-0 text-ink-soft" />
        <span className="truncate">
          {ready ? (current?.name ?? "All projects") : "All projects"}
        </span>
        <svg
          viewBox="0 0 12 12"
          className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path
            d="M2.5 4.5L6 8l3.500-3.500"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Project"
          className="absolute left-0 top-12 z-50 w-[19rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
        >
          <p className="border-b border-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
            Switch project
          </p>
          <ul className="max-h-80 overflow-y-auto py-1">
            <li>
              <button
                type="button"
                role="option"
                aria-selected={projectId === ALL}
                onClick={() => pick(ALL)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-tint"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-bg">
                  <Icon name="grid" className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    All projects
                  </span>
                  <span className="block text-xs text-ink-soft">
                    {projects.length} in the business
                  </span>
                </span>
                {projectId === ALL && (
                  <Icon name="check" className="h-4 w-4 shrink-0" />
                )}
              </button>
            </li>
            {projects.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={projectId === p.id}
                  onClick={() => pick(p.id)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-tint"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-xs font-bold">
                    {p.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {p.name}
                    </span>
                    <span className="flex items-center gap-1.5 truncate text-xs text-ink-soft">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[p.status]}`}
                      />
                      {p.status} · {p.onSite.length} on site
                    </span>
                  </span>
                  {projectId === p.id && (
                    <Icon name="check" className="h-4 w-4 shrink-0" />
                  )}
                </button>
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard/projects"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 border-t border-line px-4 py-3 text-sm font-semibold hover:bg-tint"
          >
            <Icon name="plus" className="h-4 w-4" /> Manage projects
          </Link>
        </div>
      )}
    </div>
  );
}
