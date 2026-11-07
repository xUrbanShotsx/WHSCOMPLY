"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { ALL, useScope } from "@/components/app/DemoStore";
import { ProjectForm } from "@/components/app/forms";
import {
  Avatar,
  btnDark,
  btnLight,
  Card,
  EmptyState,
  PageHeading,
  Pill,
} from "@/components/app/ui";
import { daysUntil, expiryOf } from "@/lib/data";
import { fmtDate } from "@/lib/format";

export default function ProjectsPage() {
  const s = useScope();
  const [adding, setAdding] = useState(false);

  return (
    <>
      <PageHeading
        title="Projects"
        sub="Every record belongs to a project. Switch between them from the top bar, or manage the gate list here."
        actions={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={btnDark}
          >
            <Icon name="plus" className="h-4 w-4" /> New project
          </button>
        }
      />

      {s.projects.length === 0 ? (
        <Card>
          <EmptyState
            title="No projects yet."
            body="Create one to start recording SWMS, inductions and inspections."
          />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {s.projects.map((p) => {
            const crew = s.workers.filter((w) => w.projects.includes(p.id));
            const swms = s.swms.filter(
              (x) => x.projectId === p.id && x.status === "Active",
            );
            const owed = swms.reduce(
              (n, x) =>
                n + x.required.filter((w) => !x.signed.includes(w)).length,
              0,
            );
            const open = s.actions.filter(
              (a) => a.projectId === p.id && a.status === "Open",
            ).length;
            const lapsed = crew.filter((w) =>
              w.tickets.some((t) => expiryOf(t.expires, 0) === "expired"),
            ).length;
            const selected = s.projectId === p.id;
            return (
              <Card key={p.id} className={selected ? "ring-2 ring-accent" : ""}>
                <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-lg font-extrabold tracking-tight">
                      {p.name}
                    </h2>
                    <p className="truncate text-xs text-ink-soft">
                      {p.address}
                    </p>
                  </div>
                  <Pill tone={p.status === "Live" ? "owed" : "neutral"}>
                    {p.status}
                  </Pill>
                </div>
                <dl className="grid grid-cols-3 divide-x divide-line border-b border-line text-center">
                  {[
                    ["On site", p.onSite.length],
                    ["SWMS owed", owed],
                    ["Open actions", open],
                  ].map(([k, v]) => (
                    <div key={k} className="px-2 py-3">
                      <dt className="text-[11px] text-ink-soft">{k}</dt>
                      <dd className="font-display text-xl font-extrabold tabular-nums">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="px-5 pt-3 text-xs text-ink-soft">
                  {p.client} · {p.stage} · started {fmtDate(p.start)} · manager{" "}
                  {p.manager}
                </p>
                {lapsed > 0 && (
                  <p className="mx-5 mt-3 rounded-lg bg-accent/15 px-3 py-2 text-xs font-medium">
                    {lapsed} worker{lapsed === 1 ? "" : "s"} with an expired
                    ticket on this project.
                  </p>
                )}

                <div className="px-5 pb-1 pt-4">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                    Gate: sign workers on and off
                  </p>
                </div>
                <ul className="px-2 pb-3">
                  {crew.length === 0 && (
                    <li className="px-3 py-3 text-sm text-ink-soft">
                      No workers assigned yet.
                    </li>
                  )}
                  {crew.map((w, i) => {
                    const on = p.onSite.includes(w.id);
                    const bad = w.tickets.some(
                      (t) => expiryOf(t.expires, 0) === "expired",
                    );
                    const inducted = w.inducted.includes(p.id);
                    return (
                      <li
                        key={w.id}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-tint/60"
                      >
                        <Avatar
                          initials={w.name
                            .split(" ")
                            .map((x) => x[0])
                            .join("")}
                          tone={(i % 3) as 0 | 1 | 2}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {w.name}
                          </span>
                          <span className="block truncate text-xs text-ink-soft">
                            {w.role}
                            {!inducted && " · not inducted"}
                            {bad && " · expired ticket"}
                          </span>
                        </span>
                        {on ? (
                          <button
                            type="button"
                            onClick={() => s.signOff(p.id, w.id)}
                            className={`${btnLight} !px-3 !py-1.5 text-xs`}
                          >
                            Sign off
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={bad || !inducted}
                            title={
                              bad
                                ? "Expired ticket"
                                : !inducted
                                  ? "Needs a site induction first"
                                  : ""
                            }
                            onClick={() => s.signOn(p.id, w.id)}
                            className={`${btnDark} !px-3 !py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40`}
                          >
                            Sign on
                          </button>
                        )}
                        {!inducted && (
                          <button
                            type="button"
                            onClick={() => s.induct(w.id, p.id)}
                            className={`${btnLight} !px-3 !py-1.5 text-xs`}
                          >
                            Induct
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <div className="flex items-center justify-between border-t border-line bg-bg px-5 py-3">
                  <button
                    type="button"
                    onClick={() => s.setProject(selected ? ALL : p.id)}
                    className="text-xs font-semibold underline"
                  >
                    {selected
                      ? "Showing this project. Show all"
                      : "Switch to this project"}
                  </button>
                  <span className="text-xs text-ink-soft">
                    {daysUntil(p.start) > 0
                      ? `Starts in ${daysUntil(p.start)} days`
                      : `Day ${-daysUntil(p.start)}`}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {adding && <ProjectForm onClose={() => setAdding(false)} />}
    </>
  );
}
