"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icons";
import { useScope } from "@/components/app/DemoStore";
import { InspectionStartForm } from "@/components/app/forms";
import { TemplateModal } from "@/components/app/ai-tools";
import { aiBtnLight, Sparkle } from "@/components/app/ai";
import {
  btnDark,
  Card,
  Chips,
  EmptyState,
  PageHeading,
  Pill,
  Progress,
} from "@/components/app/ui";
import { fmtDate } from "@/lib/format";

const FILTERS = ["All", "In progress", "Complete"] as const;

export default function InspectionsPage() {
  const s = useScope();
  const router = useRouter();
  const [f, setF] = useState<(typeof FILTERS)[number]>("All");
  const [adding, setAdding] = useState(false);
  const [building, setBuilding] = useState(false);

  const list = s.inspectionsIn
    .filter((i) => f === "All" || i.status === f)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeading
        title="Inspections"
        sub="Daily walks and scheduled checks. A failed item raises a corrective action automatically."
        actions={
          <>
            <button
              type="button"
              onClick={() => setBuilding(true)}
              className={aiBtnLight}
            >
              <Sparkle /> Build a checklist with AI
            </button>
            <button
              type="button"
              onClick={() => setAdding(true)}
              className={btnDark}
            >
              <Icon name="plus" className="h-4 w-4" /> Start inspection
            </button>
          </>
        }
      />
      <Card>
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <Chips value={f} options={[...FILTERS]} onChange={setF} />
          <span className="text-xs text-ink-soft">
            {list.length} inspection{list.length === 1 ? "" : "s"}
          </span>
        </div>
        {list.length === 0 ? (
          <EmptyState
            title="No inspections yet."
            body="Start a daily site walk, or a scaffold, plant, electrical or excavation check."
          />
        ) : (
          <ul>
            {list.map((i) => {
              const answered = i.items.filter((x) => x.result !== null).length;
              const failed = i.items.filter((x) => x.result === "fail").length;
              return (
                <li key={i.id} className="border-b border-line last:border-0">
                  <Link
                    href={`/dashboard/inspections/${i.id}`}
                    className="grid items-center gap-3 px-5 py-4 transition-colors hover:bg-tint/60 md:grid-cols-[1.6fr_1fr_1fr_auto]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {i.title}
                      </span>
                      <span className="block truncate text-xs text-ink-soft">
                        {s.all &&
                          `${s.projects.find((p) => p.id === i.projectId)?.name} · `}
                        {fmtDate(i.date)} · {i.inspector}
                      </span>
                    </span>
                    <span>
                      <Pill tone={i.status === "Complete" ? "ok" : "neutral"}>
                        {i.status}
                      </Pill>
                    </span>
                    <span className="min-w-0">
                      <span className="mb-1 flex justify-between text-xs text-ink-soft">
                        <span>Checked</span>
                        <span className="tabular-nums">
                          {answered}/{i.items.length}
                        </span>
                      </span>
                      <Progress
                        pct={Math.round((answered / i.items.length) * 100)}
                      />
                    </span>
                    <span className="flex items-center gap-2 justify-self-end">
                      {failed > 0 && <Pill tone="owed">{failed} failed</Pill>}
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
        <InspectionStartForm
          onClose={() => setAdding(false)}
          onStarted={(id) => router.push(`/dashboard/inspections/${id}`)}
        />
      )}
      {building && <TemplateModal onClose={() => setBuilding(false)} />}
    </>
  );
}
