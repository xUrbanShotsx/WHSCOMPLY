"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icons";
import { useStore } from "@/components/app/DemoStore";
import { StepForm } from "@/components/app/forms";
import { SwmsReviewPanel } from "@/components/app/ai-tools";
import {
  Avatar,
  btnDark,
  btnLight,
  Card,
  CardHead,
  EmptyState,
  Pill,
  Progress,
  RiskPill,
} from "@/components/app/ui";
import { expiryOf } from "@/lib/data";
import { fmtDate } from "@/lib/format";

export default function SwmsDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const s = useStore();
  const [adding, setAdding] = useState(false);
  const x = s.swms.find((w) => w.id === id);

  if (!s.ready)
    return (
      <p className="py-10 text-center text-sm text-ink-soft">Loading SWMS</p>
    );
  if (!x)
    return (
      <Card>
        <EmptyState
          title="This SWMS was not found."
          action={
            <Link href="/dashboard/swms" className={btnDark}>
              Back to SWMS
            </Link>
          }
        />
      </Card>
    );

  const project = s.projects.find((p) => p.id === x.projectId);
  const crew = x.required
    .map((wid) => s.workers.find((w) => w.id === wid))
    .filter((w): w is NonNullable<typeof w> => !!w);
  const candidates = s.workers.filter(
    (w) => w.projects.includes(x.projectId) && !x.required.includes(w.id),
  );
  const done = crew.filter((w) => x.signed.includes(w.id)).length;
  const editable = x.status !== "Superseded";
  const allSigned = crew.length > 0 && done === crew.length;

  return (
    <>
      <p className="mb-3 text-sm">
        <Link
          href="/dashboard/swms"
          className="font-semibold text-ink-soft hover:text-ink"
        >
          SWMS
        </Link>{" "}
        <span className="text-ink-soft">/</span> {x.title}
      </p>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            {x.title}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {project?.name} · version {x.version} · owner {x.owner} · updated{" "}
            {fmtDate(x.updated)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill
              tone={
                x.status === "Active"
                  ? "ok"
                  : x.status === "Draft"
                    ? "owed"
                    : "neutral"
              }
            >
              {x.status}
            </Pill>
            {x.highRisk && (
              <Pill tone="solid">High risk construction work</Pill>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {x.status === "Draft" && (
            <button
              type="button"
              onClick={() => s.updateSwms(x.id, { status: "Active" })}
              className={btnDark}
            >
              <Icon name="check" className="h-4 w-4" /> Activate
            </button>
          )}
          {x.status === "Active" && (
            <button
              type="button"
              onClick={() =>
                router.push(`/dashboard/swms/${s.newVersion(x.id)}`)
              }
              className={btnLight}
            >
              New version
            </button>
          )}
        </div>
      </div>

      {x.status === "Superseded" && (
        <p className="mb-6 rounded-xl border border-line bg-tint/60 px-4 py-3 text-sm">
          This version was replaced. It is kept so you can show what was in
          force on the days it was signed.
        </p>
      )}

      {x.status !== "Superseded" && (
        <div className="mb-6">
          <SwmsReviewPanel swms={x} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHead
            title="Work steps, hazards and controls"
            sub={`${x.steps.length} step${x.steps.length === 1 ? "" : "s"}`}
            right={
              editable && (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className={`${btnLight} !px-3 !py-1.5 text-xs`}
                >
                  <Icon name="plus" className="h-3.5 w-3.5" /> Add step
                </button>
              )
            }
          />
          <ol>
            {x.steps.map((st, i) => (
              <li
                key={st.id}
                className="border-b border-line px-5 py-4 last:border-0"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 font-mono text-xs text-ink-soft">
                    0{i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{st.task}</p>
                      <RiskPill level={st.risk} />
                    </div>
                    <p className="mt-2 text-xs font-bold uppercase tracking-wider text-ink-soft">
                      Hazard
                    </p>
                    <p className="text-sm">{st.hazard}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-wider text-ink-soft">
                      Controls
                    </p>
                    <p className="text-sm text-ink-soft">{st.controls}</p>
                  </div>
                  {editable && x.steps.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Remove step ${i + 1}`}
                      onClick={() => s.removeStep(x.id, st.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-tint hover:text-ink"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <Card>
          <CardHead
            title="Sign-on"
            sub={
              x.status === "Active"
                ? "Everyone assigned must sign v" + x.version
                : "Activate the SWMS to collect signatures"
            }
            right={
              <Pill tone={allSigned ? "ok" : "owed"}>
                {done} of {crew.length} signed
              </Pill>
            }
          />
          <div className="px-5 py-3">
            <Progress
              pct={crew.length ? Math.round((done / crew.length) * 100) : 0}
              tone={allSigned ? "ink" : "accent"}
            />
          </div>
          {crew.length === 0 ? (
            <EmptyState
              title="Nobody is assigned."
              body="Add workers from the project below."
            />
          ) : (
            <ul>
              {crew.map((w, i) => {
                const signed = x.signed.includes(w.id);
                const lapsed = w.tickets.some(
                  (t) => expiryOf(t.expires, 0) === "expired",
                );
                return (
                  <li
                    key={w.id}
                    className={`flex items-center gap-3 border-t border-line px-5 py-3 ${signed ? "" : "bg-accent/[0.07] shadow-[inset_3px_0_0_var(--accent)]"}`}
                  >
                    <Avatar
                      initials={w.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                      tone={(i % 3) as 0 | 1 | 2}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {w.name}
                      </span>
                      <span className="block truncate text-xs text-ink-soft">
                        {w.role}
                        {lapsed && " · expired ticket"}
                      </span>
                    </span>
                    {signed ? (
                      <Pill tone="ok">Signed</Pill>
                    ) : (
                      <button
                        type="button"
                        disabled={x.status !== "Active"}
                        onClick={() => s.signSwms(x.id, w.id)}
                        className={`${btnDark} !px-3 !py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        Sign
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {editable && candidates.length > 0 && (
            <div className="border-t border-line bg-bg px-5 py-3">
              <label className="text-xs font-semibold text-ink-soft">
                Add a worker to this SWMS
                <select
                  className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
                  value=""
                  onChange={(e) =>
                    e.target.value &&
                    s.updateSwms(x.id, {
                      required: [...x.required, e.target.value],
                    })
                  }
                >
                  <option value="">Choose a worker</option>
                  {candidates.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}, {w.role}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <p className="flex items-center gap-2 border-t border-line px-5 py-3 text-xs text-ink-soft">
            <Icon name="lock" className="h-3.5 w-3.5" />
            Changing the steps clears signatures so the crew signs the new
            method.
          </p>
        </Card>
      </div>

      {adding && (
        <StepForm
          onClose={() => setAdding(false)}
          onSave={(st) => s.addStep(x.id, st)}
        />
      )}
    </>
  );
}
