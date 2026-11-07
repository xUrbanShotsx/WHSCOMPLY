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
import { daysUntil, expiryOf, type Subcontractor } from "@/lib/data";
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
                    disabled={!x.approved && lapsed}
                    title={
                      !x.approved && lapsed
                        ? "Renew the lapsed documents first"
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
