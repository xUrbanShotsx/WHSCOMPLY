"use client";

import { useMemo } from "react";
import { Icon } from "@/components/Icons";
import { useScope } from "@/components/app/DemoStore";
import { SummaryPanel } from "@/components/app/ai-tools";
import {
  btnLight,
  Card,
  CardHead,
  PageHeading,
  Pill,
} from "@/components/app/ui";
import { daysUntil, expiryOf, type IncidentType } from "@/lib/data";
import { fmtDate } from "@/lib/format";

const TYPES: IncidentType[] = [
  "Near miss",
  "Hazard",
  "First aid",
  "Injury",
  "Property damage",
  "Dangerous incident",
];

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : null);
const show = (v: number | null) => (v === null ? "n/a" : `${v}%`);

function Bar({
  label,
  value,
  max,
  note,
}: {
  label: string;
  value: number;
  max: number;
  note?: string;
}) {
  return (
    <li className="grid grid-cols-[8.5rem_1fr_2rem] items-center gap-3 text-sm">
      <span className="truncate text-ink-soft">{label}</span>
      <span className="h-2.5 overflow-hidden rounded-full bg-tint" title={note}>
        <span
          className="block h-full rounded-full bg-accent"
          style={{ width: max ? `${(value / max) * 100}%` : "0%" }}
        />
      </span>
      <span className="text-right font-semibold tabular-nums">{value}</span>
    </li>
  );
}

function Kpi({
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

export default function ReportsPage() {
  const s = useScope();

  const m = useMemo(() => {
    const hours = s.projectsIn.reduce((n, p) => n + p.hours, 0);
    const lti = s.incidentsIn.filter((i) => i.lostTime);
    const recordable = s.incidentsIn.filter(
      (i) => i.type === "Injury" || i.lostTime,
    );
    const lastLti = [...lti].sort((a, b) => b.date.localeCompare(a.date))[0];
    const leading = s.incidentsIn.filter(
      (i) => i.type === "Near miss" || i.type === "Hazard",
    ).length;
    const items = s.inspectionsIn.flatMap((i) => i.items);
    const pass = items.filter((x) => x.result === "pass").length;
    const fail = items.filter((x) => x.result === "fail").length;
    const doneActions = s.actionsIn.filter((a) => a.status === "Done").length;
    const overdue = s.actionsIn.filter(
      (a) => a.status === "Open" && daysUntil(a.due) < 0,
    ).length;
    const active = s.swmsIn.filter((x) => x.status === "Active");
    const need = active.reduce((n, x) => n + x.required.length, 0);
    const signed = active.reduce(
      (n, x) => n + x.required.filter((w) => x.signed.includes(w)).length,
      0,
    );
    const okWorkers = s.workersIn.filter(
      (w) => !w.tickets.some((t) => expiryOf(t.expires, 0) === "expired"),
    ).length;
    const docs = s.docsIn.reduce(
      (acc, d) => {
        const readers =
          d.projectId === "all"
            ? s.workers
            : s.workers.filter((w) => w.projects.includes(d.projectId));
        return {
          need: acc.need + readers.length,
          got: acc.got + readers.filter((w) => d.signed.includes(w.id)).length,
        };
      },
      { need: 0, got: 0 },
    );
    const att = s.talksIn.reduce(
      (acc, t) => ({
        e: acc.e + t.expected.length,
        a: acc.a + t.attended.length,
      }),
      { e: 0, a: 0 },
    );
    return {
      hours,
      lti,
      recordable,
      lastLti,
      leading,
      ltifr: hours ? (lti.length * 1_000_000) / hours : null,
      trifr: hours ? (recordable.length * 1_000_000) / hours : null,
      inspPass: pct(pass, pass + fail),
      actClose: pct(doneActions, s.actionsIn.length),
      overdue,
      swmsPct: pct(signed, need),
      ticketPct: pct(okWorkers, s.workersIn.length),
      docsPct: pct(docs.got, docs.need),
      talkPct: pct(att.a, att.e),
      notifiable: s.incidentsIn.filter((i) => i.notifiable).length,
      open: s.incidentsIn.filter((i) => i.status !== "Closed").length,
    };
  }, [s]);

  const byType = TYPES.map((t) => ({
    t,
    n: s.incidentsIn.filter((i) => i.type === t).length,
  }));
  const maxType = Math.max(1, ...byType.map((x) => x.n));
  const bySev = (["Extreme", "High", "Medium", "Low"] as const).map((l) => ({
    l,
    n: s.incidentsIn.filter((i) => i.severity === l).length,
  }));
  const maxSev = Math.max(1, ...bySev.map((x) => x.n));

  const exportCsv = () => {
    const rows = [
      ["Measure", "Value"],
      ["Scope", s.scopeLabel],
      ["Hours worked", String(m.hours)],
      ["Lost time injuries", String(m.lti.length)],
      ["LTIFR", m.ltifr === null ? "n/a" : m.ltifr.toFixed(1)],
      ["TRIFR", m.trifr === null ? "n/a" : m.trifr.toFixed(1)],
      ["Near miss and hazard reports", String(m.leading)],
      ["Inspection pass rate", show(m.inspPass)],
      ["Action closure rate", show(m.actClose)],
      ["Overdue actions", String(m.overdue)],
      ["SWMS signed", show(m.swmsPct)],
      ["Workers with valid tickets", show(m.ticketPct)],
      ["Documents read and signed", show(m.docsPct)],
      ["Meeting and talk attendance", show(m.talkPct)],
    ];
    const body = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
    a.download = "whs-report.csv";
    a.click();
  };

  return (
    <>
      <PageHeading
        title="Reports"
        sub={`Safety performance for ${s.all ? "every project" : s.scopeLabel}. Lagging rates need hours worked, which you can enter below.`}
        actions={
          <button type="button" onClick={exportCsv} className={btnLight}>
            <Icon name="download" className="h-4 w-4" /> Export (CSV)
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Kpi
          label="LTIFR"
          value={m.ltifr === null ? "n/a" : m.ltifr.toFixed(1)}
          note={`${m.lti.length} lost time injur${m.lti.length === 1 ? "y" : "ies"} per million hours`}
          tone={m.lti.length ? "owed" : undefined}
        />
        <Kpi
          label="TRIFR"
          value={m.trifr === null ? "n/a" : m.trifr.toFixed(1)}
          note={`${m.recordable.length} recordable per million hours`}
        />
        <Kpi
          label="Days since lost time injury"
          value={m.lastLti ? String(-daysUntil(m.lastLti.date)) : "None"}
          note={
            m.lastLti ? `Last on ${fmtDate(m.lastLti.date)}` : "None recorded"
          }
        />
        <Kpi
          label="Leading indicators"
          value={String(m.leading)}
          note="near misses and hazards reported"
        />
      </div>

      <div className="mt-6">
        <SummaryPanel />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHead
            title="Compliance"
            sub="How much of the paperwork is current"
          />
          <ul className="divide-y divide-line">
            {[
              ["SWMS signed by assigned workers", m.swmsPct],
              ["Workers with no expired ticket", m.ticketPct],
              ["Inspection items passed", m.inspPass],
              ["Corrective actions closed", m.actClose],
              ["Documents read and signed", m.docsPct],
              ["Toolbox and meeting attendance", m.talkPct],
            ].map(([k, v]) => (
              <li
                key={k as string}
                className="flex items-center gap-4 px-5 py-3"
              >
                <span className="min-w-0 flex-1 text-sm">{k}</span>
                <span className="hidden h-2 w-32 overflow-hidden rounded-full bg-tint sm:block">
                  <span
                    className="block h-full rounded-full bg-accent"
                    style={{ width: `${(v as number | null) ?? 0}%` }}
                  />
                </span>
                <span className="w-12 text-right text-sm font-bold tabular-nums">
                  {show(v as number | null)}
                </span>
              </li>
            ))}
          </ul>
          <p className="border-t border-line bg-bg px-5 py-3 text-xs text-ink-soft">
            {m.overdue} overdue action{m.overdue === 1 ? "" : "s"} · {m.open}{" "}
            open incident{m.open === 1 ? "" : "s"} · {m.notifiable} notifiable
          </p>
        </Card>

        <Card>
          <CardHead title="Incidents" sub="By type and by severity" />
          <ul className="space-y-2.5 px-5 py-4">
            {byType.map((x) => (
              <Bar key={x.t} label={x.t} value={x.n} max={maxType} />
            ))}
          </ul>
          <div className="border-t border-line px-5 py-4">
            <ul className="space-y-2.5">
              {bySev.map((x) => (
                <Bar
                  key={x.l}
                  label={`${x.l} severity`}
                  value={x.n}
                  max={maxSev}
                />
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHead
          title="Hours worked and by project"
          sub="Enter the hours for each project to calculate injury frequency rates"
          right={
            <Pill tone="neutral">{m.hours.toLocaleString("en-AU")} hours</Pill>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                <th className="px-5 py-3 font-medium">Project</th>
                <th className="px-2 py-3 font-medium">Hours worked</th>
                <th className="px-2 py-3 font-medium">Incidents</th>
                <th className="px-2 py-3 font-medium">Lost time</th>
                <th className="px-2 py-3 font-medium">Open actions</th>
              </tr>
            </thead>
            <tbody>
              {s.projectsIn.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-semibold">{p.name}</td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      step={100}
                      defaultValue={p.hours}
                      aria-label={`Hours worked on ${p.name}`}
                      onBlur={(e) =>
                        Number(e.target.value) !== p.hours &&
                        s.setHours(
                          p.id,
                          Math.max(0, Number(e.target.value) || 0),
                        )
                      }
                      className="w-32 rounded-lg border border-line bg-bg px-3 py-1.5 tabular-nums"
                    />
                  </td>
                  <td className="px-2 py-3 tabular-nums">
                    {s.incidents.filter((i) => i.projectId === p.id).length}
                  </td>
                  <td className="px-2 py-3 tabular-nums">
                    {
                      s.incidents.filter(
                        (i) => i.projectId === p.id && i.lostTime,
                      ).length
                    }
                  </td>
                  <td className="px-2 py-3 tabular-nums">
                    {
                      s.actions.filter(
                        (a) => a.projectId === p.id && a.status === "Open",
                      ).length
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-line bg-bg px-5 py-3 text-xs text-ink-soft">
          LTIFR = lost time injuries × 1,000,000 ÷ hours worked. TRIFR counts
          every recordable injury. Definitions vary by industry body, so confirm
          which your clients use.
        </p>
      </Card>
    </>
  );
}
