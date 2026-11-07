"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { useScope } from "@/components/app/DemoStore";
import { DocumentForm } from "@/components/app/forms2";
import { AttachField } from "@/components/app/Attachments";
import {
  Avatar,
  btnDark,
  btnLight,
  Card,
  Chips,
  EmptyState,
  Field,
  field,
  PageHeading,
  Pill,
  Progress,
} from "@/components/app/ui";
import { addDays, daysUntil, type Doc } from "@/lib/data";
import { fmtDate } from "@/lib/format";
import { Modal } from "@/components/app/Modal";

const FILTERS = ["All", "Policy", "Procedure", "Plan", "Form"] as const;

function bump(v: string) {
  const m = /^(\d+)\.(\d+)$/.exec(v);
  return m ? `${m[1]}.${Number(m[2]) + 1}` : v;
}

export default function DocumentsPage() {
  const s = useScope();
  const [f, setF] = useState<(typeof FILTERS)[number]>("All");
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [issuing, setIssuing] = useState<Doc | null>(null);

  const list = s.docsIn
    .filter((d) => f === "All" || d.category === f)
    .sort((a, b) => a.reviewDue.localeCompare(b.reviewDue));

  return (
    <>
      <PageHeading
        title="Documents and policies"
        sub="Your WHS policy, procedures and site plans. Workers read and sign off each version, and every document has a review date."
        actions={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={btnDark}
          >
            <Icon name="plus" className="h-4 w-4" /> Add document
          </button>
        }
      />
      <Card>
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <Chips value={f} options={[...FILTERS]} onChange={setF} />
          <span className="text-xs text-ink-soft">
            {list.length} document{list.length === 1 ? "" : "s"}
          </span>
        </div>
        {list.length === 0 ? (
          <EmptyState
            title="No documents here."
            body="Add your WHS policy and the site WHS management plan."
          />
        ) : (
          <ul>
            {list.map((d) => {
              const readers =
                d.projectId === "all"
                  ? s.workers
                  : s.workers.filter((w) => w.projects.includes(d.projectId));
              const signed = readers.filter((w) =>
                d.signed.includes(w.id),
              ).length;
              const n = daysUntil(d.reviewDue);
              const isOpen = open === d.id;
              return (
                <li key={d.id} className="border-b border-line last:border-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : d.id)}
                    className="grid w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-tint/60 md:grid-cols-[1.7fr_1fr_1fr_auto]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {d.title}
                      </span>
                      <span className="block truncate text-xs text-ink-soft">
                        {d.category} · v{d.version} ·{" "}
                        {d.projectId === "all"
                          ? "Whole business"
                          : s.projects.find((p) => p.id === d.projectId)
                              ?.name}{" "}
                        · owner {d.owner}
                      </span>
                    </span>
                    <span>
                      <Pill
                        tone={n < 0 ? "owed" : n <= 30 ? "owed" : "neutral"}
                      >
                        {n < 0
                          ? `Review overdue ${-n}d`
                          : `Review ${fmtDate(d.reviewDue)}`}
                      </Pill>
                    </span>
                    <span className="min-w-0">
                      <span className="mb-1 flex justify-between text-xs text-ink-soft">
                        <span>Read and signed</span>
                        <span className="tabular-nums">
                          {signed}/{readers.length}
                        </span>
                      </span>
                      <Progress
                        pct={
                          readers.length
                            ? Math.round((signed / readers.length) * 100)
                            : 0
                        }
                        tone={
                          signed === readers.length && readers.length > 0
                            ? "ink"
                            : "accent"
                        }
                      />
                    </span>
                    <Icon
                      name="arrow"
                      className={`h-4 w-4 justify-self-end text-ink-soft transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-line bg-bg px-5 py-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                          Updated {fmtDate(d.updated)}
                        </p>
                        <button
                          type="button"
                          onClick={() => setIssuing(d)}
                          className={`${btnLight} !px-3 !py-1.5 text-xs`}
                        >
                          Issue new version
                        </button>
                      </div>
                      <div className="mb-3">
                        <AttachField
                          files={d.files ?? []}
                          onChange={(files) =>
                            s.updateDocument(d.id, { files })
                          }
                          label="Attach the document"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        />
                      </div>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {readers.map((w, i) => {
                          const done = d.signed.includes(w.id);
                          return (
                            <li
                              key={w.id}
                              className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2"
                            >
                              <Avatar
                                initials={w.name
                                  .split(" ")
                                  .map((x) => x[0])
                                  .join("")}
                                tone={(i % 3) as 0 | 1 | 2}
                              />
                              <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                                {w.name}
                              </span>
                              {done ? (
                                <Pill tone="ok">Signed</Pill>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => s.signDoc(d.id, w.id)}
                                  className={`${btnDark} !px-3 !py-1 text-xs`}
                                >
                                  Mark read
                                </button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      {adding && <DocumentForm onClose={() => setAdding(false)} />}
      {issuing && (
        <IssueModal
          doc={issuing}
          onClose={() => setIssuing(null)}
          onSave={(v, r) => s.reviewDoc(issuing.id, v, r)}
        />
      )}
    </>
  );
}

function IssueModal({
  doc,
  onClose,
  onSave,
}: {
  doc: Doc;
  onClose: () => void;
  onSave: (version: string, reviewDue: string) => void;
}) {
  return (
    <Modal
      title={`Issue a new version of ${doc.title}`}
      sub="Everyone signs the new version again"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          onSave(String(d.get("version")), String(d.get("reviewDue")));
          onClose();
        }}
        className="grid gap-4"
      >
        <Field label="New version">
          <input
            name="version"
            required
            defaultValue={bump(doc.version)}
            className={field}
          />
        </Field>
        <Field label="Next review">
          <input
            name="reviewDue"
            type="date"
            required
            defaultValue={addDays(365)}
            className={field}
          />
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnLight}>
            Cancel
          </button>
          <button type="submit" className={btnDark}>
            Issue version
          </button>
        </div>
      </form>
    </Modal>
  );
}
