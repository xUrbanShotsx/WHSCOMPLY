"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icons";
import { useScope } from "@/components/app/DemoStore";
import { IncidentForm } from "@/components/app/forms";
import {
  btnDark,
  Card,
  Chips,
  EmptyState,
  PageHeading,
  Pill,
  RiskPill,
} from "@/components/app/ui";
import { fmtDate } from "@/lib/format";

const FILTERS = ["All", "Open", "Closed"] as const;

export default function IncidentsPage() {
  const s = useScope();
  const router = useRouter();
  const [f, setF] = useState<(typeof FILTERS)[number]>("Open");
  const [adding, setAdding] = useState(false);

  const list = s.incidentsIn
    .filter(
      (i) =>
        f === "All" ||
        (f === "Closed" ? i.status === "Closed" : i.status !== "Closed"),
    )
    .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));

  return (
    <>
      <PageHeading
        title="Incidents"
        sub="Near misses, hazards, injuries and dangerous incidents. Each one follows the same steps until it is closed out."
        actions={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={btnDark}
          >
            <Icon name="plus" className="h-4 w-4" /> Report incident
          </button>
        }
      />
      <Card>
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <Chips value={f} options={[...FILTERS]} onChange={setF} />
          <span className="text-xs text-ink-soft">
            {list.length} report{list.length === 1 ? "" : "s"}
          </span>
        </div>
        {list.length === 0 ? (
          <EmptyState
            title="No incidents here."
            body="Reporting near misses early is the cheapest way to find hazards."
          />
        ) : (
          <ul>
            {list.map((i) => (
              <li key={i.id} className="border-b border-line last:border-0">
                <Link
                  href={`/dashboard/incidents/${i.id}`}
                  className="grid items-center gap-3 px-5 py-4 transition-colors hover:bg-tint/60 md:grid-cols-[1.8fr_1fr_1fr_auto]"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      {i.title}
                    </span>
                    <span className="block truncate text-xs text-ink-soft">
                      {s.all &&
                        `${s.projects.find((p) => p.id === i.projectId)?.name} · `}
                      {fmtDate(i.date)} {i.time} · {i.location}
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-2">
                    <Pill tone="neutral">{i.type}</Pill>
                    <RiskPill level={i.severity} />
                  </span>
                  <span>
                    <Pill tone={i.status === "Closed" ? "ok" : "owed"}>
                      {i.status}
                    </Pill>
                  </span>
                  <span className="flex items-center gap-2 justify-self-end">
                    {i.notifiable === null && <Pill tone="owed">Assess</Pill>}
                    {i.notifiable === true && (
                      <Pill tone="solid">Notifiable</Pill>
                    )}
                    <Icon name="arrow" className="h-4 w-4 text-ink-soft" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {adding && (
        <IncidentForm
          onClose={() => setAdding(false)}
          onReported={(id) => router.push(`/dashboard/incidents/${id}`)}
        />
      )}
    </>
  );
}
