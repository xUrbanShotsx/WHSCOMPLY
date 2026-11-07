"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { useScope } from "@/components/app/DemoStore";
import { VisitorForm } from "@/components/app/forms2";
import {
  Avatar,
  btnDark,
  btnLight,
  Card,
  Chips,
  EmptyState,
  PageHeading,
  Pill,
} from "@/components/app/ui";
import { fmtDate } from "@/lib/format";

const FILTERS = ["On site", "All"] as const;

export default function VisitorsPage() {
  const s = useScope();
  const [f, setF] = useState<(typeof FILTERS)[number]>("On site");
  const [adding, setAdding] = useState(false);

  const list = s.visitorsIn
    .filter((v) => f === "All" || !v.outAt)
    .sort((a, b) => b.inAt.localeCompare(a.inAt));

  return (
    <>
      <PageHeading
        title="Visitors"
        sub="Everyone who enters the site and is not on the crew list: clients, certifiers, deliveries. Know who is on site in an emergency."
        actions={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={btnDark}
          >
            <Icon name="plus" className="h-4 w-4" /> Sign in visitor
          </button>
        }
      />
      <Card>
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <Chips value={f} options={[...FILTERS]} onChange={setF} />
          <span className="text-xs text-ink-soft">
            {list.length} visitor{list.length === 1 ? "" : "s"}
          </span>
        </div>
        {list.length === 0 ? (
          <EmptyState title="No visitors on site." />
        ) : (
          <ul>
            {list.map((v, i) => (
              <li
                key={v.id}
                className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 last:border-0"
              >
                <Avatar
                  initials={v.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                  tone={(i % 3) as 0 | 1 | 2}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {v.name}
                  </span>
                  <span className="block truncate text-xs text-ink-soft">
                    {s.all &&
                      `${s.projects.find((x) => x.id === v.projectId)?.name} · `}
                    {v.company} · {v.purpose} · host {v.host}
                  </span>
                  <span className="block font-mono text-[11px] text-ink-soft">
                    In {fmtDate(v.inAt.slice(0, 10))} {v.inAt.slice(11)}
                    {v.outAt && ` · out ${v.outAt.slice(11)}`}
                  </span>
                </span>
                <Pill tone={v.inducted ? "ok" : "owed"}>
                  {v.inducted ? "Inducted" : "Escort required"}
                </Pill>
                {v.outAt ? (
                  <Pill tone="neutral">Signed out</Pill>
                ) : (
                  <button
                    type="button"
                    onClick={() => s.signOutVisitor(v.id)}
                    className={`${btnLight} !px-3 !py-1.5 text-xs`}
                  >
                    Sign out
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
      {adding && <VisitorForm onClose={() => setAdding(false)} />}
    </>
  );
}
