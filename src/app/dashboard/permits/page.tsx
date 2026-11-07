"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { useScope } from "@/components/app/DemoStore";
import { PermitForm } from "@/components/app/forms2";
import {
  btnDark,
  btnLight,
  Card,
  Chips,
  EmptyState,
  PageHeading,
  Pill,
  Progress,
} from "@/components/app/ui";
import { daysUntil } from "@/lib/data";
import { fmtDate } from "@/lib/format";

const FILTERS = ["Active", "Requested", "Closed", "All"] as const;

export default function PermitsPage() {
  const s = useScope();
  const [f, setF] = useState<(typeof FILTERS)[number]>("Active");
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const list = s.permitsIn
    .filter((p) =>
      f === "All"
        ? true
        : f === "Active"
          ? p.status === "Approved"
          : f === "Requested"
            ? p.status === "Requested"
            : p.status === "Closed" || p.status === "Cancelled",
    )
    .sort((a, b) => b.from.localeCompare(a.from));

  return (
    <>
      <PageHeading
        title="Permits to work"
        sub="Hot work, confined space, excavation, work at height, isolation, crane lifts and demolition. Nothing starts until every check is ticked and the permit is approved."
        actions={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={btnDark}
          >
            <Icon name="plus" className="h-4 w-4" /> Request permit
          </button>
        }
      />
      <Card>
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <Chips value={f} options={[...FILTERS]} onChange={setF} />
          <span className="text-xs text-ink-soft">
            {list.length} permit{list.length === 1 ? "" : "s"}
          </span>
        </div>
        {list.length === 0 ? (
          <EmptyState
            title="No permits here."
            body="Request one before hot work, a crane lift, an excavation or any other permit-controlled task."
          />
        ) : (
          <ul>
            {list.map((p) => {
              const done = p.checks.filter((c) => c.done).length;
              const ready = done === p.checks.length;
              const isOpen = open === p.id;
              const late = p.status === "Approved" && daysUntil(p.until) < 0;
              const locked = p.status === "Closed" || p.status === "Cancelled";
              return (
                <li key={p.id} className="border-b border-line last:border-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : p.id)}
                    className="grid w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-tint/60 md:grid-cols-[1.7fr_1fr_1fr_auto]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {p.title}
                      </span>
                      <span className="block truncate text-xs text-ink-soft">
                        {s.all &&
                          `${s.projects.find((x) => x.id === p.projectId)?.name} · `}
                        {p.kind} · {p.location}
                      </span>
                    </span>
                    <span className="flex flex-wrap gap-2">
                      <Pill
                        tone={
                          p.status === "Approved"
                            ? late
                              ? "owed"
                              : "ok"
                            : p.status === "Requested"
                              ? "owed"
                              : "neutral"
                        }
                      >
                        {late ? "Expired, close out" : p.status}
                      </Pill>
                    </span>
                    <span className="min-w-0">
                      <span className="mb-1 flex justify-between text-xs text-ink-soft">
                        <span>Checks</span>
                        <span className="tabular-nums">
                          {done}/{p.checks.length}
                        </span>
                      </span>
                      <Progress
                        pct={Math.round((done / p.checks.length) * 100)}
                        tone={ready ? "ink" : "accent"}
                      />
                    </span>
                    <Icon
                      name="arrow"
                      className={`h-4 w-4 justify-self-end text-ink-soft transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-line bg-bg px-5 py-4">
                      <p className="mb-3 text-xs text-ink-soft">
                        Issued to {p.issuedTo} · requested by {p.requestedBy} ·
                        valid {fmtDate(p.from)}
                        {p.until !== p.from && ` to ${fmtDate(p.until)}`}
                        {p.approver && ` · approved by ${p.approver}`}
                      </p>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {p.checks.map((c) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              disabled={locked}
                              aria-pressed={c.done}
                              onClick={() => s.toggleCheck(p.id, c.id)}
                              className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left disabled:cursor-not-allowed ${c.done ? "border-ink bg-surface" : "border-line bg-surface hover:border-ink-soft"}`}
                            >
                              <span
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] ${c.done ? "border-ink bg-ink text-bg" : "border-ink-soft/50"}`}
                              >
                                {c.done && (
                                  <Icon name="check" className="h-3 w-3" />
                                )}
                              </span>
                              <span className="text-sm">{c.text}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex flex-wrap justify-end gap-2">
                        {p.status === "Requested" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                s.setPermitStatus(p.id, "Cancelled")
                              }
                              className={btnLight}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={!ready}
                              title={!ready ? "Tick every check first" : ""}
                              onClick={() =>
                                s.setPermitStatus(p.id, "Approved")
                              }
                              className={`${btnDark} disabled:cursor-not-allowed disabled:opacity-40`}
                            >
                              <Icon name="check" className="h-4 w-4" /> Approve
                              permit
                            </button>
                          </>
                        )}
                        {p.status === "Approved" && (
                          <button
                            type="button"
                            onClick={() => s.setPermitStatus(p.id, "Closed")}
                            className={btnDark}
                          >
                            Close out permit
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      {adding && <PermitForm onClose={() => setAdding(false)} />}
    </>
  );
}
