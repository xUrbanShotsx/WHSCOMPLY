"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { useScope } from "@/components/app/DemoStore";
import {
  Avatar,
  btnDark,
  btnLight,
  Card,
  Chips,
  EmptyState,
  PageHeading,
} from "@/components/app/ui";
import type { AuditArea } from "@/lib/data";
import { todayISO } from "@/lib/format";

const AREAS: ("All" | AuditArea)[] = [
  "All",
  "SWMS",
  "Risks",
  "Toolbox",
  "Inspections",
  "Incidents",
  "People",
  "Permits",
  "Plant",
  "Chemicals",
  "Emergency",
  "Visitors",
  "Consultation",
  "Documents",
  "Projects",
  "Settings",
];

function download(name: string, type: string, body: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const csv = (rows: string[][]) =>
  rows
    .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
    .join("\n");

export default function AuditPage() {
  const s = useScope();
  const [area, setArea] = useState<(typeof AREAS)[number]>("All");
  const [q, setQ] = useState("");

  const list = s.auditIn.filter(
    (e) =>
      (area === "All" || e.area === area) &&
      `${e.name} ${e.act}`.toLowerCase().includes(q.toLowerCase()),
  );
  const pname = (id: string) =>
    s.projects.find((p) => p.id === id)?.name ?? "Whole business";
  const stamp = `${s.scopeLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${todayISO()}`;

  const exportCsv = () =>
    download(
      `audit-log-${stamp}.csv`,
      "text/csv",
      csv([
        ["Day", "Time", "Project", "Area", "Who", "Action", "From", "To"],
        ...list.map((e) => [
          e.day,
          e.t,
          pname(e.projectId),
          e.area,
          e.name,
          e.act,
          e.from,
          e.to,
        ]),
      ]),
    );

  const exportPack = () =>
    download(
      `audit-pack-${stamp}.json`,
      "application/json",
      JSON.stringify(
        {
          generated: new Date().toISOString(),
          company: s.settings.company.name,
          scope: s.scopeLabel,
          projects: s.projectsIn,
          swms: s.swmsIn,
          riskRegister: s.risksIn,
          permits: s.permitsIn,
          plantRegister: s.plantIn,
          chemicalsRegister: s.chemicalsIn,
          emergencyDrills: s.drillsIn,
          visitors: s.visitorsIn,
          documents: s.docsIn,
          toolboxTalks: s.talksIn,
          inspections: s.inspectionsIn,
          incidents: s.incidentsIn,
          correctiveActions: s.actionsIn,
          workers: s.workersIn,
          subcontractors: s.subsIn,
          auditLog: s.auditIn,
        },
        null,
        2,
      ),
    );

  return (
    <>
      <PageHeading
        title="Audit log"
        sub={`Every change in ${s.all ? "the business" : s.scopeLabel}: who made it, when, and what it was before. Entries cannot be edited or deleted.`}
        actions={
          <>
            <button type="button" onClick={exportCsv} className={btnLight}>
              <Icon name="download" className="h-4 w-4" /> Log (CSV)
            </button>
            <button type="button" onClick={exportPack} className={btnDark}>
              <Icon name="download" className="h-4 w-4" /> Audit pack
            </button>
          </>
        }
      />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3">
          <label className="flex min-w-[12rem] flex-1 items-center gap-2 rounded-full bg-bg px-3 py-2 text-sm text-ink-soft focus-within:ring-2 focus-within:ring-accent">
            <Icon name="search" className="h-4 w-4" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the log"
              aria-label="Search the log"
              className="w-full bg-transparent text-ink outline-none placeholder:text-ink-soft"
            />
          </label>
          <Chips value={area} options={AREAS} onChange={setArea} />
        </div>
        <div className="flex items-center gap-2 border-b border-line bg-bg px-5 py-2 text-xs text-ink-soft">
          <Icon name="lock" className="h-3.5 w-3.5" /> {list.length} entr
          {list.length === 1 ? "y" : "ies"} · the audit pack bundles every
          record for {s.all ? "all projects" : s.scopeLabel}
        </div>
        {list.length === 0 ? (
          <EmptyState title="No entries match." />
        ) : (
          <ol>
            {list.map((e) => (
              <li
                key={e.id}
                className="flex gap-3 border-b border-line px-5 py-4 last:border-0"
              >
                <Avatar initials={e.who} tone={1} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-semibold">{e.name}</span>{" "}
                    <span className="text-ink-soft">{e.act}</span>
                  </p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
                    <span className="rounded-md bg-tint px-1.5 py-0.5 text-ink-soft line-through">
                      {e.from}
                    </span>
                    <Icon name="arrow" className="h-3 w-3 opacity-50" />
                    <span className="rounded-md bg-accent/20 px-1.5 py-0.5">
                      {e.to}
                    </span>
                    <span className="ml-1 text-ink-soft">
                      {e.area} · {pname(e.projectId)}
                    </span>
                  </p>
                </div>
                <span className="shrink-0 pt-0.5 text-right font-mono text-xs text-ink-soft">
                  {e.day}
                  <br />
                  {e.t}
                </span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </>
  );
}
