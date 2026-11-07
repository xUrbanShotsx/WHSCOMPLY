"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "../Icons";

/** A centred dialog: closes on Escape or a click outside, and returns focus to where it was opened. */
export function Modal({
  title,
  sub,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  sub?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    box.current
      ?.querySelector<HTMLElement>("input,select,textarea,button")
      ?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-ink/45"
        onClick={onClose}
      />
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-surface shadow-2xl sm:rounded-3xl ${
          wide ? "sm:max-w-2xl" : "sm:max-w-lg"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-line bg-surface px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-extrabold tracking-tight">
              {title}
            </h2>
            {sub && <p className="mt-0.5 text-xs text-ink-soft">{sub}</p>}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-tint"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
