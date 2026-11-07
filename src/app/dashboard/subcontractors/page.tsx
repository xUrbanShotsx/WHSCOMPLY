"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { useScope } from "@/components/app/DemoStore";
import { DocForm, SubForm } from "@/components/app/forms";
import {
  btnDark,
  btnLight,
  Card,
  EmptyState,
  PageHeading,
  Pill,
} from "@/components/app/ui";
import {
  PREQUAL_ITEMS,
  daysUntil,
  expiryOf,
  type Subcontractor,
} from "@/lib/data";
import { AttachField } from "@/components/app/Attachments";
import { fmtDate } from "@/lib/format";

export default function SubsPage() {
  const s = useScope();
  const [adding, setAdding] = useState(false);
  const [docFor, setDocFor] = useState<Subcontractor | null>(null);

  return (
    <>
      <PageHeading
        title="Subcontractors"
        sub="Prequalify before they start and keep their insurances and licences current. Only approved subcontractors should be on site."
        actions={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={btnDark}
          >
            <Icon name="plus" className="h-4 w-4" /> Add subcontractor
          </button>
        }
      />
      {s.subsIn.length === 0 ? (
        <Card>
          <EmptyState title="No subcontractors on this project." />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {s.subsIn.map((x) => {
            const lapsed = x.docs.some(
              (d) => expiryOf(d.expires, 0) === "expired",
            );
            const crew = s.workers.filter((w) => w.company === x.id).length;
            const prequal =
              x.prequal ??
              PREQUAL_ITEMS.map((text, n) => ({
                id: `q${n}`,
                text,
                done: x.approved,
              }));
            const prequalDone = prequal.filter((q) => q.done).length;
            const ready = prequalDone === prequal.length;
            return (
              <Card key={x.id}>
                <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-lg font-extrabold tracking-tight">
                      {x.name}
                    </h2>
                    <p className="truncate text-xs text-ink-soft">
                      {x.trade} · {x.contact} · {x.phone || "no phone"} · {crew}{" "}
                      worker{crew === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Pill tone={x.approved && !lapsed ? "ok" : "owed"}>
                    {lapsed
                      ? "Paperwork lapsed"
                      : x.approved
                        ? "Approved"
                        : "Pending"}
                  </Pill>
                </div>
                <ul>
                  {x.docs.length === 0 && (
                    <li className="px-5 py-4 text-sm text-ink-soft">
                      No documents on file.
                    </li>
                  )}
                  {x.docs.map((d) => {
                    const e = expiryOf(d.expires, s.settings.warnDays);
                    return (
                      <li
                        key={d.id}
                        className="flex items-center gap-3 border-b border-line px-5 py-3 last:border-0"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {d.kind}
                          </span>
                          <span className="block text-xs text-ink-soft">
                            {d.expires
                              ? `Expires ${fmtDate(d.expires)}`
                              : "No expiry"}
                          </span>
                        </span>
                        <AttachField
                          files={d.files ?? []}
                          onChange={(files) => s.setDocFiles(x.id, d.id, files)}
                          label="Certificate"
                        />
                        <Pill
                          tone={
                            e === "expired"
                              ? "solid"
                              : e === "soon"
                                ? "owed"
                                : "ok"
                          }
                        >
                          {e === "expired"
                            ? `Expired ${-daysUntil(d.expires as string)}d ago`
                            : e === "soon"
                              ? `${daysUntil(d.expires as string)} days`
                              : "Current"}
                        </Pill>
                        <button
                          type="button"
                          aria-label={`Remove ${d.kind}`}
                          onClick={() => s.removeDoc(x.id, d.id)}
                          className="text-ink-soft hover:text-ink"
                        >
                          <Icon name="close" className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <details className="group border-t border-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-sm font-semibold">
                    Prequalification
                    <span className="flex items-center gap-2">
                      <Pill tone={ready ? "ok" : "owed"}>
                        {prequalDone} of {prequal.length} checked
                      </Pill>
                      <span className="font-mono text-lg transition-transform group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <ul className="space-y-1.5 px-5 pb-4">
                    {prequal.map((q) => (
                      <li key={q.id}>
                        <label className="flex cursor-pointer items-start gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={q.done}
                            onChange={(e) =>
                              s.setPrequal(x.id, q.id, e.target.checked)
                            }
                            className="mt-1 accent-[var(--ink)]"
                          />
                          {q.text}
                        </label>
                      </li>
                    ))}
                  </ul>
                </details>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-bg px-5 py-3">
                  <button
                    type="button"
                    onClick={() => setDocFor(x)}
                    className={`${btnLight} !px-3 !py-1.5 text-xs`}
                  >
                    <Icon name="plus" className="h-3.5 w-3.5" /> Add document
                  </button>
                  <button
                    type="button"
                    disabled={!x.approved && (lapsed || !ready)}
                    title={
                      !x.approved && lapsed
                        ? "Renew the lapsed documents first"
                        : !x.approved && !ready
                          ? "Complete the prequalification checks first"
                          : ""
                    }
                    onClick={() => s.setApproved(x.id, !x.approved)}
                    className="text-xs font-semibold underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-40"
                  >
                    {x.approved ? "Withdraw approval" : "Approve for site"}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {adding && <SubForm onClose={() => setAdding(false)} />}
      {docFor && (
        <DocForm
          name={docFor.name}
          onClose={() => setDocFor(null)}
          onSave={(d) => s.addDoc(docFor.id, d)}
        />
      )}
    </>
  );
}
