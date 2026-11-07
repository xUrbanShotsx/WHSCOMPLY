"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../Icons";
import { useStore } from "./DemoStore";

type Hit = { id: string; label: string; sub: string; href: string };

/** Searches every record in the workspace, across all projects, by name or title. */
export function GlobalSearch() {
  const s = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const hits = useMemo<Hit[]>(() => {
    const n = q.trim().toLowerCase();
    if (n.length < 2) return [];
    const p = (id: string) => s.projects.find((x) => x.id === id)?.name ?? "";
    const all: Hit[] = [
      ...s.projects.map((x) => ({
        id: x.id,
        label: x.name,
        sub: `Project · ${x.address}`,
        href: "/dashboard/projects",
      })),
      ...s.swms.map((x) => ({
        id: x.id,
        label: x.title,
        sub: `SWMS · ${p(x.projectId)}`,
        href: `/dashboard/swms/${x.id}`,
      })),
      ...s.risks.map((x) => ({
        id: x.id,
        label: x.hazard,
        sub: `Risk · ${p(x.projectId)}`,
        href: "/dashboard/risks",
      })),
      ...s.talks.map((x) => ({
        id: x.id,
        label: x.topic,
        sub: `Toolbox talk · ${p(x.projectId)}`,
        href: "/dashboard/toolbox",
      })),
      ...s.incidents.map((x) => ({
        id: x.id,
        label: x.title,
        sub: `${x.type} · ${p(x.projectId)}`,
        href: `/dashboard/incidents/${x.id}`,
      })),
      ...s.inspections.map((x) => ({
        id: x.id,
        label: x.title,
        sub: `Inspection · ${p(x.projectId)}`,
        href: `/dashboard/inspections/${x.id}`,
      })),
      ...s.workers.map((x) => ({
        id: x.id,
        label: x.name,
        sub: `Worker · ${x.role}`,
        href: "/dashboard/people",
      })),
      ...s.subs.map((x) => ({
        id: x.id,
        label: x.name,
        sub: `Subcontractor · ${x.trade}`,
        href: "/dashboard/subcontractors",
      })),
    ];
    return all
      .filter((h) => `${h.label} ${h.sub}`.toLowerCase().includes(n))
      .slice(0, 8);
  }, [q, s]);

  return (
    <div ref={box} className="relative hidden max-w-sm flex-1 md:block">
      <label className="flex items-center gap-2 rounded-full bg-bg px-4 py-2 text-sm text-ink-soft focus-within:ring-2 focus-within:ring-accent">
        <Icon name="search" className="h-4 w-4" />
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search SWMS, risks, people, incidents"
          className="w-full bg-transparent text-ink outline-none placeholder:text-ink-soft"
          aria-label="Search"
        />
      </label>
      {open && q.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-12 z-50 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
          {hits.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-ink-soft">
              No matches for &ldquo;{q}&rdquo;.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {hits.map((h) => (
                <li key={h.id}>
                  <Link
                    href={h.href}
                    onClick={() => {
                      setOpen(false);
                      setQ("");
                    }}
                    className="block px-5 py-2.5 hover:bg-tint"
                  >
                    <span className="block truncate text-sm font-semibold">
                      {h.label}
                    </span>
                    <span className="block truncate text-xs text-ink-soft">
                      {h.sub}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
