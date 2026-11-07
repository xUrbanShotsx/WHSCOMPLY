"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { useScope, ALL } from "@/components/app/DemoStore";
import { Actions, fd, Shell } from "@/components/app/forms";
import {
  Avatar,
  btnDark,
  Card,
  EmptyState,
  Field,
  field,
  PageHeading,
  Pill,
  Progress,
} from "@/components/app/ui";
import type { Notice } from "@/lib/data";
import { fmtDate, todayISO } from "@/lib/format";

const PRIORITIES: Notice["priority"][] = ["Info", "Important", "Safety alert"];

export default function NoticesPage() {
  const s = useScope();
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const list = [...s.noticesIn].sort(
    (a, b) =>
      Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date),
  );
  const audience = (n: Notice) =>
    n.projectId === "all"
      ? s.workers
      : s.workers.filter((w) => w.projects.includes(n.projectId));

  return (
    <>
      <PageHeading
        title="Site notices"
        sub="Safety alerts and site updates for the crew, instead of a group chat. See who has read each one, and chase the ones who have not."
        actions={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={btnDark}
          >
            <Icon name="plus" className="h-4 w-4" /> Post notice
          </button>
        }
      />
      {list.length === 0 ? (
        <Card>
          <EmptyState
            title="No notices."
            body="Post a safety alert or a site update for the crew."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((n) => {
            const crew = audience(n);
            const read = crew.filter((w) => n.readBy.includes(w.id)).length;
            const isOpen = open === n.id;
            return (
              <Card
                key={n.id}
                className={
                  n.priority === "Safety alert" ? "ring-2 ring-accent" : ""
                }
              >
                <div className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill
                          tone={
                            n.priority === "Safety alert"
                              ? "owed"
                              : n.priority === "Important"
                                ? "solid"
                                : "neutral"
                          }
                        >
                          {n.priority}
                        </Pill>
                        {n.pinned && <Pill tone="neutral">Pinned</Pill>}
                      </div>
                      <h2 className="mt-2 font-display text-lg font-extrabold leading-tight">
                        {n.title}
                      </h2>
                      <p className="text-xs text-ink-soft">
                        {n.projectId === "all"
                          ? "Whole business"
                          : s.projects.find((p) => p.id === n.projectId)
                              ?.name}{" "}
                        · {n.author} · {fmtDate(n.date)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        s.patch("notices", n.id, { pinned: !n.pinned })
                      }
                      className="text-xs font-semibold underline"
                    >
                      {n.pinned ? "Unpin" : "Pin"}
                    </button>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm">{n.body}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="w-48">
                      <span className="mb-1 flex justify-between text-xs text-ink-soft">
                        <span>Read</span>
                        <span className="tabular-nums">
                          {read}/{crew.length}
                        </span>
                      </span>
                      <Progress
                        pct={
                          crew.length
                            ? Math.round((read / crew.length) * 100)
                            : 0
                        }
                        tone={read === crew.length ? "ink" : "accent"}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : n.id)}
                      className="text-xs font-semibold underline"
                    >
                      {isOpen ? "Hide readers" : "Who has read it"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        window.confirm("Delete this notice?") &&
                        s.remove("notices", n.id)
                      }
                      className="ml-auto text-xs font-semibold text-ink-soft underline hover:text-ink"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <ul className="grid gap-2 border-t border-line bg-bg px-5 py-4 sm:grid-cols-2">
                    {crew.map((w, i) => {
                      const done = n.readBy.includes(w.id);
                      return (
                        <li
                          key={w.id}
                          className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2"
                        >
                          <Avatar
                            initials={w.name
                              .split(" ")
                              .map((x) => x[0])
                              .join("")}
                            tone={(i % 3) as 0 | 1 | 2}
                          />
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                            {w.name}
                          </span>
                          {done ? (
                            <Pill tone="ok">Read</Pill>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                s.patch("notices", n.id, {
                                  readBy: [...n.readBy, w.id],
                                })
                              }
                              className={`${btnDark} !px-3 !py-1 text-xs`}
                            >
                              Mark read
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {adding && (
        <Shell title="Post a notice" onClose={() => setAdding(false)}>
          <form
            onSubmit={(e) => {
              const g = fd(e);
              s.add(
                "notices",
                {
                  projectId: g("projectId"),
                  title: g("title"),
                  body: g("body"),
                  priority: g("priority") as Notice["priority"],
                  author: g("author"),
                  date: todayISO(),
                  pinned: g("priority") === "Safety alert",
                  readBy: [],
                },
                {
                  area: "Notices",
                  projectId: g("projectId"),
                  act: `posted the notice ${g("title")}`,
                  to: g("priority"),
                },
              );
              setAdding(false);
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <Field label="Title" className="sm:col-span-2">
              <input name="title" required className={field} />
            </Field>
            <Field label="Applies to">
              <select
                name="projectId"
                defaultValue={s.all ? ALL : s.scopeId}
                className={field}
              >
                <option value="all">Whole business</option>
                {s.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Priority">
              <select name="priority" defaultValue="Info" className={field}>
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Posted by" className="sm:col-span-2">
              <input
                name="author"
                required
                defaultValue="Sam Kowalski"
                className={field}
              />
            </Field>
            <Field label="Message" className="sm:col-span-2">
              <textarea name="body" required rows={4} className={field} />
            </Field>
            <div className="sm:col-span-2">
              <Actions onClose={() => setAdding(false)} submit="Post notice" />
            </div>
          </form>
        </Shell>
      )}
    </>
  );
}
