"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icons";
import { useStore } from "@/components/app/DemoStore";
import { ActionForm } from "@/components/app/forms";
import { InvestigatePanel } from "@/components/app/ai-tools";
import {
  btnDark,
  btnLight,
  Card,
  CardHead,
  EmptyState,
  field,
  Pill,
  RiskPill,
} from "@/components/app/ui";
import { daysUntil, INCIDENT_FLOW } from "@/lib/data";
import { fmtDate } from "@/lib/format";

export default function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const [adding, setAdding] = useState(false);
  const x = s.incidents.find((i) => i.id === id);

  if (!s.ready)
    return (
      <p className="py-10 text-center text-sm text-ink-soft">
        Loading incident
      </p>
    );
  if (!x)
    return (
      <Card>
        <EmptyState
          title="This incident was not found."
          action={
            <Link href="/dashboard/incidents" className={btnDark}>
              Back to incidents
            </Link>
          }
        />
      </Card>
    );

  const project = s.projects.find((p) => p.id === x.projectId);
  const step = INCIDENT_FLOW.indexOf(x.status);
  const next = INCIDENT_FLOW[step + 1];
  const related = s.actions.filter(
    (a) => a.source === "Incident" && a.sourceLabel === x.title,
  );
  const openRelated = related.filter((a) => a.status === "Open").length;
  const closed = x.status === "Closed";

  const blocker =
    next === "Investigating" && x.notifiable === null
      ? "Assess whether this is notifiable first."
      : next === "Closed" && openRelated > 0
        ? `${openRelated} corrective action${openRelated === 1 ? " is" : "s are"} still open.`
        : next === "Closed" && !x.cause.trim()
          ? "Record the cause before closing."
          : "";

  return (
    <>
      <p className="mb-3 text-sm">
        <Link
          href="/dashboard/incidents"
          className="font-semibold text-ink-soft hover:text-ink"
        >
          Incidents
        </Link>{" "}
        <span className="text-ink-soft">/</span> {x.title}
      </p>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          {x.title}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {project?.name} · {fmtDate(x.date)} {x.time} · {x.location} · reported
          by {x.reporter}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill tone="neutral">{x.type}</Pill>
          <RiskPill level={x.severity} />
          {x.notifiable === true && (
            <Pill tone="solid">Notifiable to the regulator</Pill>
          )}
        </div>
      </div>

      <ol
        aria-label="Progress"
        className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {INCIDENT_FLOW.map((st, i) => (
          <li
            key={st}
            aria-current={i === step ? "step" : undefined}
            className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
              i < step
                ? "border-ink bg-ink text-bg"
                : i === step
                  ? "border-accent bg-accent/20"
                  : "border-line text-ink-soft"
            }`}
          >
            <span className="block font-mono text-[10px] uppercase tracking-widest opacity-70">
              Step {i + 1}
            </span>
            {st}
          </li>
        ))}
      </ol>

      {!closed && (
        <div className="mb-6">
          <InvestigatePanel incident={x} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHead title="What happened" />
            <div className="space-y-4 px-5 py-4 text-sm">
              <p>{x.description}</p>
              {x.people && (
                <p>
                  <span className="font-semibold">People involved: </span>
                  <span className="text-ink-soft">{x.people}</span>
                </p>
              )}
            </div>
          </Card>

          <Card>
            <CardHead title="Investigation" sub="Cause and notifiability" />
            <div className="space-y-4 px-5 py-4">
              <label className="block text-sm font-medium">
                Cause and contributing factors
                <textarea
                  key={x.id + x.cause}
                  defaultValue={x.cause}
                  disabled={closed}
                  rows={3}
                  onBlur={(e) =>
                    e.target.value !== x.cause &&
                    s.updateIncident(x.id, { cause: e.target.value })
                  }
                  className={field}
                  placeholder="What allowed this to happen?"
                />
              </label>
              <fieldset>
                <legend className="text-sm font-medium">
                  Is this notifiable to the regulator?
                </legend>
                <p className="text-xs text-ink-soft">
                  Deaths, serious injuries or illnesses and dangerous incidents
                  must be notified immediately. Check your state
                  regulator&apos;s rules.
                </p>
                <div className="mt-2 inline-flex rounded-full bg-tint p-0.5">
                  {[
                    { v: false, l: "Not notifiable" },
                    { v: true, l: "Notifiable" },
                  ].map((o) => (
                    <button
                      key={o.l}
                      type="button"
                      disabled={closed}
                      aria-pressed={x.notifiable === o.v}
                      onClick={() =>
                        s.updateIncident(x.id, { notifiable: o.v })
                      }
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold disabled:cursor-not-allowed ${
                        x.notifiable === o.v
                          ? o.v
                            ? "bg-accent text-ink"
                            : "bg-ink text-bg"
                          : "text-ink-soft hover:text-ink"
                      }`}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
              </fieldset>
              {(x.type === "Injury" || x.type === "Dangerous incident") && (
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    disabled={closed}
                    checked={!!x.lostTime}
                    onChange={(e) =>
                      s.updateIncident(x.id, { lostTime: e.target.checked })
                    }
                    className="mt-1 accent-[var(--ink)]"
                  />
                  <span>
                    <span className="font-medium">Lost time injury</span>
                    <span className="block text-xs text-ink-soft">
                      The worker was unable to work a full shift afterwards.
                      Counted in the injury frequency rate on Reports.
                    </span>
                  </span>
                </label>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHead
              title="Corrective actions"
              sub={`${related.length - openRelated} of ${related.length} done`}
              right={
                !closed && (
                  <button
                    type="button"
                    onClick={() => setAdding(true)}
                    className={`${btnLight} !px-3 !py-1.5 text-xs`}
                  >
                    <Icon name="plus" className="h-3.5 w-3.5" /> Add
                  </button>
                )
              }
            />
            {related.length === 0 ? (
              <EmptyState
                title="No actions yet."
                body="Add what will stop it happening again."
              />
            ) : (
              <ul>
                {related.map((a) => {
                  const d = daysUntil(a.due);
                  return (
                    <li
                      key={a.id}
                      className="flex items-center gap-3 border-t border-line px-5 py-3 first:border-t-0"
                    >
                      <button
                        type="button"
                        aria-label={
                          a.status === "Done"
                            ? "Reopen action"
                            : "Mark action done"
                        }
                        onClick={() => s.toggleAction(a.id)}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] ${a.status === "Done" ? "border-ink bg-ink text-bg" : "border-ink-soft/50"}`}
                      >
                        {a.status === "Done" && (
                          <Icon name="check" className="h-3 w-3" />
                        )}
                      </button>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-sm ${a.status === "Done" ? "text-ink-soft line-through" : "font-semibold"}`}
                        >
                          {a.title}
                        </span>
                        <span className="block text-xs text-ink-soft">
                          {a.owner}
                        </span>
                      </span>
                      {a.status === "Open" && (
                        <Pill tone={d < 0 ? "owed" : "neutral"}>
                          {d < 0 ? `Overdue ${-d}d` : fmtDate(a.due)}
                        </Pill>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {!closed && next && (
            <Card className="p-5">
              <p className="text-sm font-semibold">Next step: {next}</p>
              {blocker && (
                <p className="mt-1 text-xs text-ink-soft">{blocker}</p>
              )}
              <button
                type="button"
                disabled={!!blocker}
                onClick={() => s.advanceIncident(x.id, next)}
                className={`${btnDark} mt-4 disabled:cursor-not-allowed disabled:opacity-40`}
              >
                Move to {next} <Icon name="arrow" className="h-4 w-4" />
              </button>
            </Card>
          )}
          {closed && (
            <p className="flex items-center gap-2 rounded-xl border border-line bg-tint/60 px-4 py-3 text-sm">
              <Icon name="lock" className="h-4 w-4" /> Closed out. The record is
              kept for audit.
            </p>
          )}
        </div>
      </div>

      {adding && (
        <ActionFormFor
          incidentTitle={x.title}
          projectId={x.projectId}
          onClose={() => setAdding(false)}
        />
      )}
    </>
  );
}

function ActionFormFor({
  incidentTitle,
  projectId,
  onClose,
}: {
  incidentTitle: string;
  projectId: string;
  onClose: () => void;
}) {
  const { addAction } = useStore();
  return (
    <ActionForm
      onClose={onClose}
      fixed={{ projectId, source: "Incident", sourceLabel: incidentTitle }}
      onSave={addAction}
    />
  );
}
