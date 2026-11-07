"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icons";
import { useScope } from "@/components/app/DemoStore";
import { RiskForm } from "@/components/app/forms";
import { PhotoHazardsModal } from "@/components/app/ai-tools";
import { aiBtnLight, Sparkle } from "@/components/app/ai";
import {
  btnDark,
  Card,
  CardHead,
  Chips,
  EmptyState,
  PageHeading,
  Pill,
  RiskPill,
} from "@/components/app/ui";
import {
  CONSEQUENCE,
  daysUntil,
  LIKELIHOOD,
  rating,
  type Risk,
} from "@/lib/data";
import { fmtDate } from "@/lib/format";

const STATUS = ["All", "Open", "Controlled", "Closed"] as const;

const CELL: Record<string, string> = {
  Extreme: "bg-ink text-bg",
  High: "bg-accent text-ink",
  Medium: "bg-accent/35 text-ink",
  Low: "bg-tint text-ink-soft",
};

export default function RisksPage() {
  const s = useScope();
  const [status, setStatus] = useState<(typeof STATUS)[number]>("All");
  const [cell, setCell] = useState<[number, number] | null>(null);
  const [adding, setAdding] = useState(false);
  const [photo, setPhoto] = useState(false);
  const [editing, setEditing] = useState<Risk | null>(null);

  const live = useMemo(
    () => s.risksIn.filter((r) => r.status !== "Closed"),
    [s.risksIn],
  );

  const grid = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of live) {
      const k = `${r.resL}-${r.resC}`;
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  }, [live]);

  const list = useMemo(
    () =>
      s.risksIn
        .filter(
          (r) =>
            (status === "All" || r.status === status) &&
            (!cell || (r.resL === cell[0] && r.resC === cell[1])),
        )
        .sort(
          (a, b) =>
            b.resL * b.resC - a.resL * a.resC ||
            a.review.localeCompare(b.review),
        ),
    [s.risksIn, status, cell],
  );

  return (
    <>
      <PageHeading
        title="Risk register"
        sub="Every hazard, how bad it is before and after controls, who owns it and when it is next reviewed."
        actions={
          <>
            <button
              type="button"
              onClick={() => setPhoto(true)}
              className={aiBtnLight}
            >
              <Sparkle /> Spot hazards in a photo
            </button>
            <button
              type="button"
              onClick={() => setAdding(true)}
              className={btnDark}
            >
              <Icon name="plus" className="h-4 w-4" /> Add risk
            </button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <Card className="self-start">
          <CardHead
            title="Residual risk"
            sub={
              cell
                ? "Filtered. Click the cell again to clear."
                : "Open and controlled risks, after controls"
            }
          />
          <div className="p-4">
            <div className="flex gap-2">
              <p className="writing-vertical self-center font-mono text-[10px] uppercase tracking-widest text-ink-soft [writing-mode:vertical-rl] rotate-180">
                Likelihood
              </p>
              <div className="flex-1">
                <div className="grid grid-cols-5 gap-1">
                  {[5, 4, 3, 2, 1].flatMap((l) =>
                    [1, 2, 3, 4, 5].map((c) => {
                      const n = grid.get(`${l}-${c}`) ?? 0;
                      const on = cell?.[0] === l && cell?.[1] === c;
                      return (
                        <button
                          key={`${l}-${c}`}
                          type="button"
                          aria-label={`Likelihood ${LIKELIHOOD[l - 1]}, consequence ${CONSEQUENCE[c - 1]}, ${n} risk${n === 1 ? "" : "s"}`}
                          aria-pressed={on}
                          onClick={() => setCell(on ? null : [l, c])}
                          className={`flex aspect-square items-center justify-center rounded-md text-sm font-bold ${CELL[rating(l, c)]} ${on ? "ring-2 ring-ink ring-offset-1" : ""} ${n === 0 ? "opacity-40" : ""}`}
                        >
                          {n || ""}
                        </button>
                      );
                    }),
                  )}
                </div>
                <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                  Consequence
                </p>
              </div>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2 text-xs">
              {["Low", "Medium", "High", "Extreme"].map((l) => (
                <li key={l} className="flex items-center gap-1.5">
                  <span
                    className={`h-3 w-3 rounded ${CELL[l].split(" ")[0]}`}
                  />
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
            <Chips value={status} options={[...STATUS]} onChange={setStatus} />
            <span className="text-xs text-ink-soft">
              {list.length} of {s.risksIn.length}
            </span>
          </div>
          {list.length === 0 ? (
            <EmptyState
              title="No risks match."
              body="Add the hazards on your site so each has an owner and a review date."
            />
          ) : (
            <ul>
              {list.map((r) => {
                const d = daysUntil(r.review);
                const project = s.projects.find((p) => p.id === r.projectId);
                return (
                  <li
                    key={r.id}
                    className="border-b border-line px-5 py-4 last:border-0"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{r.hazard}</p>
                        <p className="text-xs text-ink-soft">
                          {s.all && `${project?.name} · `}
                          {r.category} · owner {r.owner}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <RiskPill level={rating(r.likelihood, r.consequence)} />
                        <Icon name="arrow" className="h-3.5 w-3.5 opacity-50" />
                        <RiskPill level={rating(r.resL, r.resC)} />
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-ink-soft">{r.controls}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <select
                        aria-label={`Status of ${r.hazard}`}
                        value={r.status}
                        onChange={(e) =>
                          s.updateRisk(r.id, {
                            status: e.target.value as Risk["status"],
                          })
                        }
                        className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold"
                      >
                        {["Open", "Controlled", "Closed"].map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                      {r.status !== "Closed" && (
                        <Pill tone={d < 0 ? "owed" : "neutral"}>
                          {d < 0
                            ? `Review overdue ${-d}d`
                            : `Review ${fmtDate(r.review)}`}
                        </Pill>
                      )}
                      <span className="ml-auto flex gap-1">
                        <button
                          type="button"
                          aria-label={`Edit ${r.hazard}`}
                          onClick={() => setEditing(r)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-tint hover:text-ink"
                        >
                          <Icon name="pencil" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${r.hazard}`}
                          onClick={() =>
                            window.confirm(
                              "Remove this risk from the register?",
                            ) && s.removeRisk(r.id)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-tint hover:text-ink"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {adding && <RiskForm onClose={() => setAdding(false)} />}
      {photo && <PhotoHazardsModal onClose={() => setPhoto(false)} />}
      {editing && (
        <RiskForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(v) => s.updateRisk(editing.id, v)}
        />
      )}
    </>
  );
}
