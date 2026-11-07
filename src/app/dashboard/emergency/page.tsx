"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { useScope } from "@/components/app/DemoStore";
import { DrillForm } from "@/components/app/forms2";
import {
  btnDark,
  btnLight,
  Card,
  CardHead,
  EmptyState,
  field,
  PageHeading,
  Pill,
} from "@/components/app/ui";
import { daysUntil, type Project } from "@/lib/data";
import { fmtDate } from "@/lib/format";

export default function EmergencyPage() {
  const s = useScope();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const drills = [...s.drillsIn].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeading
        title="Emergency management"
        sub="Assembly points, nearest hospital, wardens and first aiders for each project, plus the drills and checks that keep the emergency plan working."
        actions={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={btnDark}
          >
            <Icon name="plus" className="h-4 w-4" /> Record drill or check
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {s.projectsIn.map((p) => {
          const aiders = s.workers.filter(
            (w) =>
              w.projects.includes(p.id) &&
              w.tickets.some((t) => t.kind === "First aid"),
          );
          const isEditing = editing === p.id;
          return (
            <Card key={p.id}>
              <CardHead
                title={p.name}
                sub="Emergency details"
                right={
                  <button
                    type="button"
                    onClick={() => setEditing(isEditing ? null : p.id)}
                    className={`${btnLight} !px-3 !py-1.5 text-xs`}
                  >
                    {isEditing ? "Done" : "Edit"}
                  </button>
                }
              />
              {isEditing ? (
                <div className="grid gap-3 p-5">
                  {(
                    [
                      ["assembly", "Assembly point"],
                      ["hospital", "Nearest hospital"],
                      ["emergencyContact", "Emergency contact"],
                      ["wardens", "Wardens"],
                    ] as [
                      keyof Pick<
                        Project,
                        "assembly" | "hospital" | "emergencyContact" | "wardens"
                      >,
                      string,
                    ][]
                  ).map(([k, label]) => (
                    <label key={k} className="block text-sm font-medium">
                      {label}
                      <input
                        defaultValue={p[k]}
                        onBlur={(e) =>
                          e.target.value !== p[k] &&
                          s.updateEmergency(p.id, { [k]: e.target.value })
                        }
                        className={field}
                      />
                    </label>
                  ))}
                </div>
              ) : (
                <dl className="divide-y divide-line text-sm">
                  {[
                    ["Assembly point", p.assembly],
                    ["Nearest hospital", p.hospital],
                    ["Emergency contact", p.emergencyContact],
                    ["Wardens", p.wardens],
                    [
                      "First aiders",
                      aiders.length
                        ? aiders.map((w) => w.name).join(", ")
                        : "None on file",
                    ],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="grid gap-1 px-5 py-3 sm:grid-cols-[9rem_1fr]"
                    >
                      <dt className="text-ink-soft">{k}</dt>
                      <dd className="font-medium">{v || "Not set"}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardHead
          title="Drills and checks"
          sub="Evacuation drills, warden checks, first aid kit checks and plan reviews"
        />
        {drills.length === 0 ? (
          <EmptyState
            title="Nothing recorded yet."
            body="Record the first evacuation drill for each project."
          />
        ) : (
          <ul>
            {drills.map((d) => {
              const later = s.drills.some(
                (x) =>
                  x.projectId === d.projectId &&
                  x.kind === d.kind &&
                  x.date > d.date,
              );
              const n = daysUntil(d.nextDue);
              return (
                <li
                  key={d.id}
                  className="flex flex-wrap items-start gap-3 border-t border-line px-5 py-3.5 first:border-t-0"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {d.kind}
                    </span>
                    <span className="block text-xs text-ink-soft">
                      {s.projects.find((x) => x.id === d.projectId)?.name} ·{" "}
                      {fmtDate(d.date)} · {d.by}
                    </span>
                    {d.notes && (
                      <span className="mt-1 block text-sm text-ink-soft">
                        {d.notes}
                      </span>
                    )}
                  </span>
                  {!later && (
                    <Pill tone={n < 0 ? "owed" : n <= 14 ? "owed" : "neutral"}>
                      {n < 0 ? `Overdue ${-n}d` : `Next ${fmtDate(d.nextDue)}`}
                    </Pill>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      {adding && <DrillForm onClose={() => setAdding(false)} />}
    </>
  );
}
