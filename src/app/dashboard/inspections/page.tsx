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
import { fmtDate, todayISO } from "@/lib/format";
import { CardHead, field } from "@/components/app/ui";
import { addDays, daysUntil, INSPECTION_TEMPLATES } from "@/lib/data";

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
      <Card className="mt-6">
        <CardHead
          title="Inspection schedule"
          sub="Routine checks that must happen on a rhythm. Overdue ones appear in your needs-attention list."
        />
        {s.schedulesIn.length === 0 ? (
          <EmptyState
            title="Nothing scheduled."
            body="Add a daily site walk or a weekly scaffold check below."
          />
        ) : (
          <ul>
            {s.schedulesIn.map((sc) => {
              const last = s.inspections
                .filter(
                  (i) => i.projectId === sc.projectId && i.kind === sc.kind,
                )
                .map((i) => i.date)
                .sort()
                .pop();
              const next = last ? addDays(sc.everyDays, last) : todayISO();
              const n = daysUntil(next);
              return (
                <li
                  key={sc.id}
                  className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-3 first:border-t-0"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {sc.kind}
                    </span>
                    <span className="block truncate text-xs text-ink-soft">
                      {s.projects.find((p) => p.id === sc.projectId)?.name} ·
                      every{" "}
                      {sc.everyDays === 1
                        ? "day"
                        : sc.everyDays === 7
                          ? "week"
                          : `${sc.everyDays} days`}{" "}
                      · last {last ? fmtDate(last) : "never"}
                    </span>
                  </span>
                  <Pill tone={n < 0 ? "owed" : n === 0 ? "owed" : "ok"}>
                    {n < 0
                      ? `Overdue ${-n}d`
                      : n === 0
                        ? "Due today"
                        : `Next ${fmtDate(next)}`}
                  </Pill>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/dashboard/inspections/${s.startInspection(sc.projectId, sc.kind, "Sam Kowalski")}`,
                      )
                    }
                    className={`${btnDark} !px-3 !py-1.5 text-xs`}
                  >
                    Start now
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${sc.kind} schedule`}
                    onClick={() => s.remove("schedules", sc.id)}
                    className="text-ink-soft hover:text-ink"
                  >
                    <Icon name="close" className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const projectId = String(f.get("projectId"));
            s.add(
              "schedules",
              {
                projectId,
                kind: String(f.get("kind")),
                everyDays: Number(f.get("every")),
              },
              {
                area: "Inspections",
                projectId,
                act: `scheduled a ${String(f.get("kind")).toLowerCase()}`,
                to: `Every ${f.get("every")} days`,
              },
            );
            e.currentTarget.reset();
          }}
          className="flex flex-wrap items-end gap-3 border-t border-line bg-bg px-5 py-4"
        >
          <label className="text-xs font-semibold text-ink-soft">
            Project
            <select
              name="projectId"
              required
              defaultValue={s.all ? "" : s.scopeId}
              className={`${field} !mt-1`}
            >
              {s.all && (
                <option value="" disabled>
                  Choose
                </option>
              )}
              {s.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-ink-soft">
            Checklist
            <select name="kind" className={`${field} !mt-1`}>
              {[
                ...Object.keys(INSPECTION_TEMPLATES),
                ...s.customTemplates.map((t) => t.name),
              ].map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-ink-soft">
            How often
            <select name="every" defaultValue="7" className={`${field} !mt-1`}>
              <option value="1">Daily</option>
              <option value="7">Weekly</option>
              <option value="14">Fortnightly</option>
              <option value="30">Monthly</option>
            </select>
          </label>
          <button type="submit" className={btnDark}>
            Add to schedule
          </button>
        </form>
      </Card>

      {building && <TemplateModal onClose={() => setBuilding(false)} />}
    </>
  );
}
