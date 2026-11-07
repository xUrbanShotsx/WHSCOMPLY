"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { useScope } from "@/components/app/DemoStore";
import { TicketForm } from "@/components/app/forms";
import {
  Avatar,
  btnLight,
  Card,
  CardHead,
  EmptyState,
  PageHeading,
} from "@/components/app/ui";
import { expiryOf, type Expiry, type Worker } from "@/lib/data";

type Comp = { label: string; match: (kind: string) => boolean };

const COMPS: Comp[] = [
  { label: "White card", match: (k) => k.toLowerCase().includes("white card") },
  { label: "Working at heights", match: (k) => k === "Working at heights" },
  {
    label: "High risk licence",
    match: (k) => k.startsWith("High risk work licence"),
  },
  { label: "First aid", match: (k) => k === "First aid" },
  { label: "Confined space", match: (k) => k === "Confined space" },
  { label: "Asbestos awareness", match: (k) => k === "Asbestos awareness" },
];

function cell(w: Worker, c: Comp, warn: number): Expiry | "missing" {
  const hits = w.tickets.filter((t) => c.match(t.kind));
  if (hits.length === 0) return "missing";
  const best = hits.map((t) => expiryOf(t.expires, warn));
  if (best.includes("valid") || best.includes("none")) return "valid";
  return best.includes("soon") ? "soon" : "expired";
}

const STYLE: Record<string, string> = {
  valid: "bg-ink text-bg",
  none: "bg-ink text-bg",
  soon: "bg-accent text-ink",
  expired: "bg-ink/10 text-ink line-through",
  missing: "border border-dashed border-ink-soft/40 text-ink-soft",
};
const TEXT: Record<string, string> = {
  valid: "Valid",
  none: "Valid",
  soon: "Expiring",
  expired: "Expired",
  missing: "None",
};

export default function TrainingPage() {
  const s = useScope();
  const [adding, setAdding] = useState<Worker | null>(null);
  const warn = s.settings.warnDays;
  const rows = s.workersIn;

  const stats = COMPS.map((c) => {
    const states = rows.map((w) => cell(w, c, warn));
    const ok = states.filter((x) => x === "valid" || x === "soon").length;
    return { c, pct: rows.length ? Math.round((ok / rows.length) * 100) : 0 };
  });
  const inducted = (w: Worker) =>
    s.all ? w.inducted.length > 0 : w.inducted.includes(s.scopeId);

  return (
    <>
      <PageHeading
        title="Training matrix"
        sub="Who holds which competency, across the people on the selected project. Gaps show at a glance so the right person does the right task."
      />
      {rows.length === 0 ? (
        <Card>
          <EmptyState title="No workers on this project yet." />
        </Card>
      ) : (
        <Card>
          <CardHead
            title="Competencies"
            sub={`${rows.length} people · expiring means within ${warn} days`}
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                  <th className="px-5 py-3 font-medium">Worker</th>
                  <th className="px-2 py-3 font-medium">Inducted</th>
                  {COMPS.map((c) => (
                    <th key={c.label} className="px-2 py-3 font-medium">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((w, i) => (
                  <tr key={w.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-2.5">
                      <span className="flex items-center gap-3">
                        <Avatar
                          initials={w.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                          tone={(i % 3) as 0 | 1 | 2}
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">
                            {w.name}
                          </span>
                          <span className="block truncate text-xs text-ink-soft">
                            {w.role}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="px-2 py-2.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${inducted(w) ? STYLE.valid : STYLE.missing}`}
                      >
                        {inducted(w) ? "Yes" : "No"}
                      </span>
                    </td>
                    {COMPS.map((c) => {
                      const st = cell(w, c, warn);
                      return (
                        <td key={c.label} className="px-2 py-2.5">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${STYLE[st]}`}
                          >
                            {TEXT[st]}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-2 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => setAdding(w)}
                        className={`${btnLight} !px-3 !py-1 text-xs`}
                        aria-label={`Add training for ${w.name}`}
                      >
                        <Icon name="plus" className="h-3.5 w-3.5" /> Add
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-bg">
                  <td className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                    Coverage
                  </td>
                  <td />
                  {stats.map(({ c, pct }) => (
                    <td
                      key={c.label}
                      className="px-2 py-3 text-xs font-semibold tabular-nums"
                    >
                      {pct}%
                    </td>
                  ))}
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
      {adding && (
        <TicketForm
          name={adding.name}
          onClose={() => setAdding(null)}
          onSave={(t) => s.addTicket(adding.id, t)}
        />
      )}
    </>
  );
}
