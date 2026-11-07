"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@/components/Icons";
import { useStore } from "@/components/app/DemoStore";
import { AttachField } from "@/components/app/Attachments";
import {
  btnDark,
  Card,
  CardHead,
  EmptyState,
  Pill,
  Progress,
} from "@/components/app/ui";
import type { InspResult } from "@/lib/data";
import { fmtDate } from "@/lib/format";

const OPTIONS: { v: InspResult; label: string }[] = [
  { v: "pass", label: "Pass" },
  { v: "fail", label: "Fail" },
  { v: "na", label: "N/A" },
];

export default function InspectionDetail() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const x = s.inspections.find((i) => i.id === id);

  if (!s.ready)
    return (
      <p className="py-10 text-center text-sm text-ink-soft">
        Loading inspection
      </p>
    );
  if (!x)
    return (
      <Card>
        <EmptyState
          title="This inspection was not found."
          action={
            <Link href="/dashboard/inspections" className={btnDark}>
              Back to inspections
            </Link>
          }
        />
      </Card>
    );

  const answered = x.items.filter((i) => i.result !== null).length;
  const failed = x.items.filter((i) => i.result === "fail").length;
  const project = s.projects.find((p) => p.id === x.projectId);
  const locked = x.status === "Complete";

  return (
    <>
      <p className="mb-3 text-sm">
        <Link
          href="/dashboard/inspections"
          className="font-semibold text-ink-soft hover:text-ink"
        >
          Inspections
        </Link>{" "}
        <span className="text-ink-soft">/</span> {x.title}
      </p>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            {x.title}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {project?.name} · {fmtDate(x.date)} · inspector {x.inspector}
          </p>
        </div>
        {!locked && (
          <button
            type="button"
            disabled={answered < x.items.length}
            onClick={() => s.completeInspection(x.id)}
            className={`${btnDark} disabled:cursor-not-allowed disabled:opacity-40`}
            title={answered < x.items.length ? "Answer every item first" : ""}
          >
            <Icon name="check" className="h-4 w-4" /> Complete inspection
          </button>
        )}
      </div>

      <Card>
        <CardHead
          title="Checklist"
          sub={
            locked
              ? "Completed. Results are locked."
              : "Mark each item. A fail raises a corrective action."
          }
          right={
            <Pill tone={failed ? "owed" : "neutral"}>
              {answered} of {x.items.length} checked
              {failed ? ` · ${failed} failed` : ""}
            </Pill>
          }
        />
        <div className="px-5 py-3">
          <Progress pct={Math.round((answered / x.items.length) * 100)} />
        </div>
        <ul>
          {x.items.map((it) => (
            <li
              key={it.id}
              className={`border-t border-line px-5 py-3.5 ${it.result === "fail" ? "bg-accent/[0.08] shadow-[inset_3px_0_0_var(--accent)]" : ""}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p
                  className={`min-w-0 flex-1 text-sm ${it.result === null ? "font-semibold" : ""}`}
                >
                  {it.text}
                </p>
                <div
                  role="group"
                  aria-label={it.text}
                  className="flex rounded-full bg-tint p-0.5"
                >
                  {OPTIONS.map((o) => (
                    <button
                      key={o.label}
                      type="button"
                      disabled={locked}
                      aria-pressed={it.result === o.v}
                      onClick={() => s.setResult(x.id, it.id, o.v)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold disabled:cursor-not-allowed ${
                        it.result === o.v
                          ? o.v === "fail"
                            ? "bg-accent text-ink"
                            : "bg-ink text-bg"
                          : "text-ink-soft hover:text-ink"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              {(it.result === "fail" || (it.files?.length ?? 0) > 0) && (
                <div className="mt-2">
                  <AttachField
                    files={it.files ?? []}
                    onChange={(files) => s.setItemFiles(x.id, it.id, files)}
                    disabled={locked}
                    label="Add photo of the issue"
                  />
                </div>
              )}
              {(it.result === "fail" || it.note) && (
                <input
                  defaultValue={it.note}
                  disabled={locked}
                  aria-label={`Note for ${it.text}`}
                  placeholder="What was wrong and what was done?"
                  onBlur={(e) =>
                    e.target.value !== it.note &&
                    s.setResult(x.id, it.id, it.result, e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm disabled:opacity-70"
                />
              )}
            </li>
          ))}
        </ul>
      </Card>
      {failed > 0 && (
        <p className="mt-4 text-sm text-ink-soft">
          {failed} corrective action{failed === 1 ? " was" : "s were"} raised
          from this inspection.{" "}
          <Link href="/dashboard/actions" className="font-semibold underline">
            View actions
          </Link>
        </p>
      )}
    </>
  );
}
