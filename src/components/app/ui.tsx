import type { ReactNode } from "react";
import { Icon } from "../Icons";

export type Tone = "ok" | "owed" | "neutral" | "solid";

export function Pill({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  const styles: Record<Tone, string> = {
    ok: "bg-ink/[0.06] text-ink",
    owed: "bg-accent/15 text-ink",
    neutral: "bg-tint text-ink-soft",
    solid: "bg-ink text-bg",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[tone]}`}
    >
      {tone === "ok" && <Icon name="check" className="h-3 w-3" />}
      {tone === "owed" && (
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      )}
      {children}
    </span>
  );
}

export function Avatar({
  initials,
  tone = 0,
}: {
  initials: string;
  tone?: 0 | 1 | 2;
}) {
  const t = [
    "bg-accent/15 text-ink",
    "bg-ink/10 text-ink",
    "bg-tint text-ink-soft",
  ][tone];
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${t}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function Progress({
  pct,
  tone = "accent",
}: {
  pct: number;
  tone?: "accent" | "ink";
}) {
  return (
    <div
      className="h-1.5 overflow-hidden rounded-full bg-tint"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full ${tone === "ink" ? "bg-ink" : "bg-accent"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-line bg-surface ${className}`}
    >
      {children}
    </section>
  );
}

export function CardHead({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
      <div className="min-w-0">
        <h2 className="font-display text-base font-extrabold tracking-tight">
          {title}
        </h2>
        {sub && <p className="mt-0.5 text-xs text-ink-soft">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Stat({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "owed";
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-xs font-medium text-ink-soft">{label}</p>
      <p className="mt-2 font-display text-2xl font-extrabold tabular-nums tracking-tight xl:text-3xl">
        {value}
      </p>
      {note && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-soft">
          {tone === "owed" && (
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          )}
          {note}
        </p>
      )}
    </div>
  );
}

export function PageHeading({
  title,
  sub,
  actions,
  compact = false,
}: {
  title: string;
  sub?: string;
  actions?: ReactNode;
  /** Inside a module that already shows the page title, only the intro text and actions are drawn. */
  compact?: boolean;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {compact ? (
          <p className="sr-only">{title}</p>
        ) : (
          <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            {title}
          </h1>
        )}
        {sub && (
          <p
            className={`text-sm text-ink-soft ${compact ? "max-w-xl" : "mt-1"}`}
          >
            {sub}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export const btn =
  "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200";
export const btnDark = `${btn} bg-ink text-bg hover:bg-ink/85`;
export const btnLight = `${btn} border border-line bg-surface hover:bg-tint`;

/* ---------- forms, dialogs and small helpers ---------- */

export const field =
  "mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm text-ink focus:border-ink";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm font-medium text-ink ${className}`}>
      {label}
      {hint && <span className="ml-1 font-normal text-ink-soft">({hint})</span>}
      {children}
    </label>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="px-5 py-12 text-center">
      <p className="font-semibold">{title}</p>
      {body && <p className="mt-1 text-sm text-ink-soft">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string; count?: number }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex flex-wrap rounded-full bg-tint p-1"
    >
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          type="button"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            value === o.value
              ? "bg-surface shadow-sm"
              : "text-ink-soft hover:text-ink"
          }`}
        >
          {o.label}
          {o.count !== undefined && (
            <span className="ml-1 text-ink-soft">{o.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Chips<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={`rounded-full px-3.5 py-2 text-xs font-semibold sm:px-3 sm:py-1 ${
            value === o
              ? "bg-ink text-bg"
              : "bg-tint text-ink-soft hover:text-ink"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function RiskPill({ level }: { level: string }) {
  const tone: Tone =
    level === "Extreme" || level === "High"
      ? "owed"
      : level === "Medium"
        ? "neutral"
        : "ok";
  return <Pill tone={tone}>{level}</Pill>;
}

/** Page-level tab bar for modules that hold several views. */
export function TabBar<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: T[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="mb-6 flex gap-1 overflow-x-auto border-b border-line"
    >
      {options.map((t) => (
        <button
          key={t}
          role="tab"
          type="button"
          aria-selected={value === t}
          onClick={() => onChange(t)}
          className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${
            value === t
              ? "border-accent text-ink"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
