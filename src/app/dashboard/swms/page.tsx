"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Icon } from "@/components/Icons";
import { useScope } from "@/components/app/DemoStore";
import { SwmsForm } from "@/components/app/forms";
import {
  btnDark,
  Card,
  Chips,
  EmptyState,
  PageHeading,
  Pill,
  Progress,
  RiskPill,
} from "@/components/app/ui";
import type { RiskLevel } from "@/lib/data";
import { fmtDate } from "@/lib/format";

const FILTERS = ["All", "Active", "Draft", "Superseded"] as const;
const ORDER: RiskLevel[] = ["Low", "Medium", "High", "Extreme"];

export default function SwmsPage() {
  const s = useScope();
  const router = useRouter();
  const [f, setF] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);

  const list = useMemo(
    () =>
      s.swmsIn.filter(
        (x) =>
          (f === "All" || x.status === f) &&
          x.title.toLowerCase().includes(q.toLowerCase()),
      ),
    [s.swmsIn, f, q],
  );

  return (
    <>
      <PageHeading
        title="SWMS"
        sub="Safe work method statements for high risk construction work. Everyone assigned must sign the current version before work starts."
        actions={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={btnDark}
          >
            <Icon name="plus" className="h-4 w-4" /> New SWMS
          </button>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3">
          <label className="flex min-w-[12rem] flex-1 items-center gap-2 rounded-full bg-bg px-3 py-2 text-sm text-ink-soft focus-within:ring-2 focus-within:ring-accent">
            <Icon name="search" className="h-4 w-4" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search SWMS"
              aria-label="Search SWMS"
              className="w-full bg-transparent text-ink outline-none placeholder:text-ink-soft"
            />
          </label>
          <Chips value={f} options={[...FILTERS]} onChange={setF} />
        </div>

        {list.length === 0 ? (
          <EmptyState
            title="No SWMS here yet."
            body="Create one for any high risk task and assign it to the crew."
            action={
              <button
                type="button"
                onClick={() => setAdding(true)}
                className={btnDark}
              >
                <Icon name="plus" className="h-4 w-4" /> New SWMS
              </button>
            }
          />
        ) : (
          <ul>
            {list.map((x) => {
              const need = x.required.length;
              const done = x.required.filter((w) =>
                x.signed.includes(w),
              ).length;
              const top = x.steps.reduce<RiskLevel>(
                (m, st) =>
                  ORDER.indexOf(st.risk) > ORDER.indexOf(m) ? st.risk : m,
                "Low",
              );
              const project = s.projects.find((p) => p.id === x.projectId);
              return (
                <li key={x.id} className="border-b border-line last:border-0">
                  <Link
                    href={`/dashboard/swms/${x.id}`}
                    className="grid items-center gap-3 px-5 py-4 transition-colors hover:bg-tint/60 md:grid-cols-[1.6fr_1fr_1fr_auto]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {x.title}
                      </span>
                      <span className="block truncate text-xs text-ink-soft">
                        {s.all && `${project?.name} · `}v{x.version} ·{" "}
                        {x.steps.length} step{x.steps.length === 1 ? "" : "s"} ·
                        updated {fmtDate(x.updated)}
                      </span>
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      <Pill
                        tone={
                          x.status === "Active"
                            ? "neutral"
                            : x.status === "Draft"
                              ? "owed"
                              : "neutral"
                        }
                      >
                        {x.status}
                      </Pill>
                      {x.highRisk && <Pill tone="solid">High risk work</Pill>}
                    </span>
                    <span className="min-w-0">
                      <span className="mb-1 flex justify-between text-xs text-ink-soft">
                        <span>Signed</span>
                        <span className="tabular-nums">
                          {done}/{need}
                        </span>
                      </span>
                      <Progress
                        pct={need ? Math.round((done / need) * 100) : 0}
                      />
                    </span>
                    <span className="flex items-center gap-2 justify-self-end">
                      <RiskPill level={top} />
                      <Icon name="arrow" className="h-4 w-4 text-ink-soft" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {adding && (
        <SwmsForm
          onClose={() => setAdding(false)}
          onCreated={(id) => router.push(`/dashboard/swms/${id}`)}
        />
      )}
    </>
  );
}
