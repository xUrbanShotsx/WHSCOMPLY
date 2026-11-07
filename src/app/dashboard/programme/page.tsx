"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icons";
import { useScope } from "@/components/app/DemoStore";
import { Actions, fd, ProjectField, Shell } from "@/components/app/forms";
import {
  btnDark,
  Card,
  EmptyState,
  Field,
  field,
  PageHeading,
  Pill,
} from "@/components/app/ui";
import {
  addDays,
  daysUntil,
  TRADES,
  type ProgTask,
  type Swms,
} from "@/lib/data";
import { fmtDate, todayISO } from "@/lib/format";

const dayIndex = (iso: string) => daysUntil(iso);

/** Finds a SWMS for the task by shared words, since a task and its SWMS are named by people. */
function swmsFor(task: ProgTask, all: Swms[]) {
  const words = task.name
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length > 4);
  return all.find(
    (w) =>
      w.projectId === task.projectId &&
      w.status === "Active" &&
      words.some((x) => w.title.toLowerCase().includes(x)),
  );
}

export default function ProgrammePage() {
  const s = useScope();
  const [adding, setAdding] = useState(false);

  const tasks = useMemo(
    () => [...s.tasksIn].sort((a, b) => a.start.localeCompare(b.start)),
    [s.tasksIn],
  );
  const min = tasks.length
    ? Math.min(...tasks.map((t) => dayIndex(t.start)), 0)
    : 0;
  const max = tasks.length
    ? Math.max(...tasks.map((t) => dayIndex(t.end)), 7)
    : 14;
  const span = Math.max(1, max - min);
  const pos = (d: number) => `${((d - min) / span) * 100}%`;
  const todayPos = pos(0);

  return (
    <>
      <PageHeading
        title="Programme"
        sub="A live programme the site runs on. High risk tasks show whether their SWMS is signed before the start date."
        actions={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={btnDark}
          >
            <Icon name="plus" className="h-4 w-4" /> Add task
          </button>
        }
      />
      <Card>
        {tasks.length === 0 ? (
          <EmptyState
            title="No tasks yet."
            body="Add the main tasks so the crew and safety team see what is coming."
          />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[44rem]">
              <div className="relative grid grid-cols-[15rem_1fr] border-b border-line bg-bg text-[11px] font-mono uppercase tracking-widest text-ink-soft">
                <div className="px-5 py-3">Task</div>
                <div className="relative py-3">
                  <span className="absolute left-0">
                    {fmtDate(addDays(min))}
                  </span>
                  <span className="absolute right-3">
                    {fmtDate(addDays(max))}
                  </span>
                  <span className="invisible">.</span>
                </div>
              </div>
              <ul className="relative">
                {tasks.map((t) => {
                  const a = dayIndex(t.start);
                  const b = dayIndex(t.end);
                  const swms =
                    t.needsSwms && t.progress < 100
                      ? swmsFor(t, s.swms)
                      : undefined;
                  const unsigned = swms
                    ? swms.required.filter((w) => !swms.signed.includes(w))
                        .length
                    : 0;
                  const soon = a <= 7 && t.progress < 100;
                  const warn =
                    t.needsSwms &&
                    t.progress < 100 &&
                    soon &&
                    (!swms || unsigned > 0);
                  return (
                    <li
                      key={t.id}
                      className="grid grid-cols-[15rem_1fr] items-center border-b border-line last:border-0"
                    >
                      <div className="min-w-0 px-5 py-3">
                        <p className="truncate text-sm font-semibold">
                          {t.name}
                        </p>
                        <p className="truncate text-xs text-ink-soft">
                          {s.all &&
                            `${s.projects.find((p) => p.id === t.projectId)?.name} · `}
                          {t.trade}
                        </p>
                      </div>
                      <div className="relative h-14">
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 w-px bg-accent"
                          style={{ left: todayPos }}
                        />
                        <div
                          className="absolute top-3 h-7 overflow-hidden rounded-md bg-tint ring-1 ring-line"
                          style={{
                            left: pos(a),
                            width: `calc(${pos(b)} - ${pos(a)} + 1.5%)`,
                          }}
                          title={`${fmtDate(t.start)} to ${fmtDate(t.end)}, ${t.progress}% complete`}
                        >
                          <div
                            className="h-full bg-accent/70"
                            style={{ width: `${t.progress}%` }}
                          />
                          <span className="absolute inset-0 flex items-center px-2 text-[11px] font-semibold">
                            {t.progress}%
                          </span>
                        </div>
                      </div>
                      <div className="col-span-2 flex flex-wrap items-center gap-2 px-5 pb-3">
                        {t.needsSwms && t.progress < 100 && (
                          <Pill tone={warn ? "owed" : "neutral"}>
                            {swms
                              ? unsigned
                                ? `SWMS: ${unsigned} unsigned`
                                : "SWMS signed"
                              : "No matching SWMS"}
                          </Pill>
                        )}
                        <label className="ml-auto flex items-center gap-2 text-xs text-ink-soft">
                          Progress
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={t.progress}
                            onChange={(e) =>
                              s.patch("tasks", t.id, {
                                progress: Number(e.target.value),
                              })
                            }
                            aria-label={`Progress of ${t.name}`}
                            className="w-28 accent-[var(--ink)]"
                          />
                        </label>
                        <button
                          type="button"
                          aria-label={`Delete ${t.name}`}
                          onClick={() =>
                            window.confirm("Delete this task?") &&
                            s.remove("tasks", t.id)
                          }
                          className="text-ink-soft hover:text-ink"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
        <p className="border-t border-line bg-bg px-5 py-3 text-xs text-ink-soft">
          The orange line is today.
        </p>
      </Card>

      {adding && (
        <Shell title="Add a programme task" onClose={() => setAdding(false)}>
          <form
            onSubmit={(e) => {
              const g = fd(e);
              s.add(
                "tasks",
                {
                  projectId: g("projectId"),
                  name: g("name"),
                  trade: g("trade"),
                  start: g("start"),
                  end: g("end"),
                  progress: 0,
                  needsSwms: g("needsSwms") === "yes",
                },
                {
                  area: "Programme",
                  projectId: g("projectId"),
                  act: `added the task ${g("name")}`,
                  to: `${fmtDate(g("start"))} to ${fmtDate(g("end"))}`,
                },
              );
              setAdding(false);
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <Field label="Task" className="sm:col-span-2">
              <input name="name" required className={field} />
            </Field>
            <ProjectField />
            <Field label="Trade">
              <select name="trade" className={field}>
                {TRADES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Start">
              <input
                name="start"
                type="date"
                required
                defaultValue={todayISO()}
                className={field}
              />
            </Field>
            <Field label="Finish">
              <input
                name="end"
                type="date"
                required
                defaultValue={addDays(7)}
                className={field}
              />
            </Field>
            <Field
              label="High risk work needing a SWMS?"
              className="sm:col-span-2"
            >
              <select name="needsSwms" defaultValue="no" className={field}>
                <option value="no">No</option>
                <option value="yes">
                  Yes, a signed SWMS is needed before it starts
                </option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Actions onClose={() => setAdding(false)} submit="Add task" />
            </div>
          </form>
        </Shell>
      )}
    </>
  );
}
