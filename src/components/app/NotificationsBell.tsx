"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "../Icons";
import { Avatar } from "./ui";
import { useAttention } from "./useAttention";

/** The bell: what needs action in the selected project, with a dot when something is overdue. */
export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const items = useAttention();
  const urgent = items.filter((i) => i.tone === "owed").length;

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

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-label={`Notifications${items.length ? `, ${items.length} item${items.length === 1 ? "" : "s"}` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-tint"
      >
        <Icon name="bell" className="h-5 w-5" />
        {items.length > 0 && (
          <span
            className={`absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
              urgent ? "bg-accent text-ink" : "bg-ink-soft text-bg"
            }`}
          >
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-4 top-[4.25rem] z-50 sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[22rem] overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <p className="font-display text-base font-extrabold">
              Needs action
            </p>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold underline"
            >
              Dashboard
            </Link>
          </div>
          {items.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-ink-soft">
              Nothing is due. You are up to date.
            </p>
          ) : (
            <ul className="max-h-[min(26rem,60dvh)] divide-y divide-line overflow-y-auto">
              {items.slice(0, 12).map((a) => (
                <li key={a.id}>
                  <Link
                    href={a.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-tint"
                  >
                    <Avatar initials={a.who} tone={1} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {a.title}
                      </span>
                      <span className="block truncate text-xs text-ink-soft">
                        {a.where}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-medium text-ink-soft">
                      {a.due}
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
