"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { useScope } from "@/components/app/DemoStore";
import { Modal } from "@/components/app/Modal";
import {
  Avatar,
  btnDark,
  btnLight,
  Card,
  CardHead,
  EmptyState,
  Field,
  field,
  PageHeading,
  Pill,
} from "@/components/app/ui";
import type { Project, Worker } from "@/lib/data";
import { fmtDate } from "@/lib/format";

function InductModal({
  project,
  worker,
  onClose,
}: {
  project: Project;
  worker: Worker;
  onClose: () => void;
}) {
  const s = useScope();
  const [ticked, setTicked] = useState<string[]>([]);
  const [sig, setSig] = useState("");
  const first = worker.name.toLowerCase().split(/\s+/)[0];
  const signed =
    sig.trim().toLowerCase().includes(first) && sig.trim().length >= 3;
  const all = ticked.length === project.inductionTopics.length;

  return (
    <Modal
      title={`Induct ${worker.name}`}
      sub={`${project.name}. The worker reads each topic and signs at the end.`}
      onClose={onClose}
      wide
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          s.recordInduction({
            projectId: project.id,
            workerId: worker.id,
            by: "Sam Kowalski",
            topics: ticked.length,
            signedAs: sig.trim(),
          });
          onClose();
        }}
        className="space-y-4"
      >
        <ul className="space-y-2">
          {project.inductionTopics.map((t) => {
            const on = ticked.includes(t);
            return (
              <li key={t}>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm ${on ? "border-ink bg-tint/50" : "border-line"}`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={(e) =>
                      setTicked(
                        e.target.checked
                          ? [...ticked, t]
                          : ticked.filter((x) => x !== t),
                      )
                    }
                    className="mt-0.5 accent-[var(--ink)]"
                  />
                  {t}
                </label>
              </li>
            );
          })}
        </ul>
        <Field
          label={`I have read and understood the above. Type your full name to sign: ${worker.name}`}
        >
          <input
            value={sig}
            onChange={(e) => setSig(e.target.value)}
            className={field}
            autoComplete="off"
          />
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnLight}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={!all || !signed}
            className={`${btnDark} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <Icon name="check" className="h-4 w-4" /> Sign and complete
            induction
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function InductionsPage() {
  const s = useScope();
  const [target, setTarget] = useState<{ p: Project; w: Worker } | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <>
      <PageHeading
        title="Inductions"
        sub="Every worker is inducted to each site before they sign on. Set what the induction covers, then record each worker's signed acknowledgement."
      />
      {s.projectsIn.length === 0 ? (
        <Card>
          <EmptyState title="No projects yet." />
        </Card>
      ) : (
        <div className="space-y-6">
          {s.projectsIn.map((p) => {
            const crew = s.workers.filter((w) => w.projects.includes(p.id));
            const pending = crew.filter((w) => !w.inducted.includes(p.id));
            const records = s.inductions
              .filter((r) => r.projectId === p.id)
              .sort((a, b) => b.date.localeCompare(a.date));
            const isEditing = editing === p.id;
            return (
              <Card key={p.id}>
                <CardHead
                  title={p.name}
                  sub={`${crew.length - pending.length} of ${crew.length} workers inducted`}
                  right={
                    pending.length > 0 ? (
                      <Pill tone="owed">{pending.length} to induct</Pill>
                    ) : (
                      <Pill tone="ok">All inducted</Pill>
                    )
                  }
                />
                <div className="grid gap-0 lg:grid-cols-2 lg:divide-x lg:divide-line">
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                        Induction content
                      </p>
                      <button
                        type="button"
                        onClick={() => setEditing(isEditing ? null : p.id)}
                        className="text-xs font-semibold underline"
                      >
                        {isEditing ? "Done" : "Edit"}
                      </button>
                    </div>
                    <ol className="space-y-1.5 text-sm">
                      {p.inductionTopics.map((t, i) => (
                        <li key={t} className="flex items-start gap-2">
                          <span className="w-5 shrink-0 font-mono text-xs text-ink-soft">
                            {i + 1}
                          </span>
                          <span className="flex-1">{t}</span>
                          {isEditing && (
                            <button
                              type="button"
                              aria-label={`Remove topic ${i + 1}`}
                              onClick={() =>
                                s.updateProject(p.id, {
                                  inductionTopics: p.inductionTopics.filter(
                                    (_, k) => k !== i,
                                  ),
                                })
                              }
                              className="text-ink-soft hover:text-ink"
                            >
                              <Icon name="close" className="h-4 w-4" />
                            </button>
                          )}
                        </li>
                      ))}
                    </ol>
                    {isEditing && (
                      <form
                        className="mt-3 flex gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const v = String(
                            new FormData(form).get("topic") ?? "",
                          ).trim();
                          if (v)
                            s.updateProject(p.id, {
                              inductionTopics: [...p.inductionTopics, v],
                            });
                          form.reset();
                        }}
                      >
                        <input
                          name="topic"
                          aria-label="New topic"
                          placeholder="Add a topic specific to this site"
                          className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm"
                        />
                        <button type="submit" className={`${btnLight} !px-3`}>
                          Add
                        </button>
                      </form>
                    )}
                  </div>

                  <div>
                    {pending.length > 0 && (
                      <div className="border-b border-line p-5">
                        <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                          Waiting for induction
                        </p>
                        <ul className="space-y-2">
                          {pending.map((w, i) => (
                            <li key={w.id} className="flex items-center gap-3">
                              <Avatar
                                initials={w.name
                                  .split(" ")
                                  .map((x) => x[0])
                                  .join("")}
                                tone={(i % 3) as 0 | 1 | 2}
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold">
                                  {w.name}
                                </span>
                                <span className="block truncate text-xs text-ink-soft">
                                  {w.role}
                                </span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setTarget({ p, w })}
                                className={`${btnDark} !px-3 !py-1.5 text-xs`}
                              >
                                Induct
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="p-5">
                      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                        Signed records
                      </p>
                      {records.length === 0 ? (
                        <p className="text-sm text-ink-soft">
                          No inductions recorded yet.
                        </p>
                      ) : (
                        <ul className="divide-y divide-line">
                          {records.map((r) => (
                            <li
                              key={r.id}
                              className="flex items-center gap-3 py-2 text-sm"
                            >
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-semibold">
                                  {s.workers.find((w) => w.id === r.workerId)
                                    ?.name ?? "Unknown"}
                                </span>
                                <span className="block truncate text-xs text-ink-soft">
                                  {fmtDate(r.date)} · by {r.by} · signed as{" "}
                                  {r.signedAs}
                                </span>
                              </span>
                              <Pill tone="ok">{r.topics} topics</Pill>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {target && (
        <InductModal
          project={target.p}
          worker={target.w}
          onClose={() => setTarget(null)}
        />
      )}
    </>
  );
}
