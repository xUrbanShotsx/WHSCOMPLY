"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { useScope } from "@/components/app/DemoStore";
import { TalkForm } from "@/components/app/forms";
import {
  Avatar,
  btnDark,
  Card,
  Chips,
  EmptyState,
  PageHeading,
  Pill,
  Progress,
} from "@/components/app/ui";
import { daysUntil, type MeetingKind } from "@/lib/data";
import { fmtDate } from "@/lib/format";

const FILTERS = ["All", "Upcoming", "Held"] as const;

export function MeetingsView({
  kinds,
  title,
  sub,
  addLabel,
  emptyTitle,
  emptyBody,
}: {
  kinds: MeetingKind[];
  title: string;
  sub: string;
  addLabel: string;
  emptyTitle: string;
  emptyBody: string;
}) {
  const s = useScope();
  const [f, setF] = useState<(typeof FILTERS)[number]>("All");
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const list = s.talksIn
    .filter((t) => kinds.includes(t.kind ?? "Toolbox talk"))
    .filter(
      (t) =>
        f === "All" ||
        (f === "Upcoming" ? daysUntil(t.date) >= 0 : daysUntil(t.date) < 0),
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeading
        title={title}
        sub={sub}
        actions={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={btnDark}
          >
            <Icon name="plus" className="h-4 w-4" /> {addLabel}
          </button>
        }
      />

      <Card>
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <Chips value={f} options={[...FILTERS]} onChange={setF} />
          <span className="text-xs text-ink-soft">
            {list.length} record{list.length === 1 ? "" : "s"}
          </span>
        </div>
        {list.length === 0 ? (
          <EmptyState title={emptyTitle} body={emptyBody} />
        ) : (
          <ul>
            {list.map((t) => {
              const d = daysUntil(t.date);
              const isOpen = open === t.id;
              const crew = t.expected
                .map((id) => s.workers.find((w) => w.id === id))
                .filter((w): w is NonNullable<typeof w> => !!w);
              const pct = crew.length
                ? Math.round((t.attended.length / crew.length) * 100)
                : 0;
              return (
                <li key={t.id} className="border-b border-line last:border-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : t.id)}
                    className="grid w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-tint/60 md:grid-cols-[1.6fr_1fr_1fr_auto]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {t.topic}
                      </span>
                      <span className="block truncate text-xs text-ink-soft">
                        {s.all &&
                          `${s.projects.find((p) => p.id === t.projectId)?.name} · `}
                        {fmtDate(t.date)} · {t.presenter}
                      </span>
                    </span>
                    <span>
                      <Pill tone={d >= 0 ? "neutral" : "ok"}>
                        {d > 0
                          ? `In ${d} day${d === 1 ? "" : "s"}`
                          : d === 0
                            ? "Today"
                            : "Held"}
                      </Pill>
                    </span>
                    <span className="min-w-0">
                      <span className="mb-1 flex justify-between text-xs text-ink-soft">
                        <span>Attended</span>
                        <span className="tabular-nums">
                          {t.attended.length}/{crew.length}
                        </span>
                      </span>
                      <Progress
                        pct={pct}
                        tone={pct === 100 ? "ink" : "accent"}
                      />
                    </span>
                    <Icon
                      name="arrow"
                      className={`h-4 w-4 justify-self-end text-ink-soft transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-line bg-bg px-5 py-4">
                      {t.notes && (
                        <p className="mb-4 text-sm text-ink-soft">{t.notes}</p>
                      )}
                      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                        Attendance
                      </p>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {crew.map((w, i) => {
                          const here = t.attended.includes(w.id);
                          return (
                            <li key={w.id}>
                              <button
                                type="button"
                                aria-pressed={here}
                                onClick={() => s.toggleAttendance(t.id, w.id)}
                                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left ${here ? "border-ink bg-surface" : "border-line bg-surface hover:border-ink-soft"}`}
                              >
                                <span
                                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] ${here ? "border-ink bg-ink text-bg" : "border-ink-soft/50"}`}
                                >
                                  {here && (
                                    <Icon name="check" className="h-3 w-3" />
                                  )}
                                </span>
                                <Avatar
                                  initials={w.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                  tone={(i % 3) as 0 | 1 | 2}
                                />
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-semibold">
                                    {w.name}
                                  </span>
                                  <span className="block truncate text-xs text-ink-soft">
                                    {w.role}
                                  </span>
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            window.confirm("Delete this toolbox talk?") &&
                            s.removeTalk(t.id)
                          }
                          className="text-xs font-semibold text-ink-soft underline hover:text-ink"
                        >
                          Delete record
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {adding && <TalkForm kinds={kinds} onClose={() => setAdding(false)} />}
    </>
  );
}
