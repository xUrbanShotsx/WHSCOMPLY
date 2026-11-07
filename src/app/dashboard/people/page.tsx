"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icons";
import { useScope } from "@/components/app/DemoStore";
import { TicketForm, WorkerForm } from "@/components/app/forms";
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
import { daysUntil, expiryOf, type Worker } from "@/lib/data";
import { fmtDate } from "@/lib/format";

const FILTERS = ["All", "Needs attention", "On site"] as const;

function health(w: Worker, warn: number) {
  const es = w.tickets.map((t) => expiryOf(t.expires, warn));
  return es.includes("expired")
    ? "expired"
    : es.includes("soon")
      ? "soon"
      : "ok";
}

export default function PeoplePage() {
  const s = useScope();
  const [f, setF] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [ticketFor, setTicketFor] = useState<Worker | null>(null);

  const onSiteIds = useMemo(
    () => new Set(s.projects.flatMap((p) => p.onSite)),
    [s.projects],
  );
  const list = s.workersIn.filter(
    (w) =>
      `${w.name} ${w.role}`.toLowerCase().includes(q.toLowerCase()) &&
      (f === "All" ||
        (f === "On site"
          ? onSiteIds.has(w.id)
          : health(w, s.settings.warnDays) !== "ok")),
  );
  const company = (id: string) =>
    id === "own"
      ? s.settings.company.name
      : (s.subs.find((x) => x.id === id)?.name ?? "Unknown");

  return (
    <>
      <PageHeading
        title="Workers and tickets"
        sub="Everyone who works on your sites, with their white card and licences. A lapsed ticket blocks sign-on at the gate."
        actions={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={btnDark}
          >
            <Icon name="plus" className="h-4 w-4" /> Add worker
          </button>
        }
      />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3">
          <label className="flex min-w-[12rem] flex-1 items-center gap-2 rounded-full bg-bg px-3 py-2 text-sm text-ink-soft focus-within:ring-2 focus-within:ring-accent">
            <Icon name="search" className="h-4 w-4" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name or trade"
              aria-label="Search workers"
              className="w-full bg-transparent text-ink outline-none placeholder:text-ink-soft"
            />
          </label>
          <Chips value={f} options={[...FILTERS]} onChange={setF} />
        </div>

        {list.length === 0 ? (
          <EmptyState
            title="No workers match."
            body="Add the people who work on this project."
          />
        ) : (
          <ul>
            {list.map((w, i) => {
              const h = health(w, s.settings.warnDays);
              const isOpen = open === w.id;
              return (
                <li key={w.id} className="border-b border-line last:border-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : w.id)}
                    className="grid w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-tint/60 md:grid-cols-[1.6fr_1.2fr_1fr_auto]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Avatar
                        initials={w.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                        tone={(i % 3) as 0 | 1 | 2}
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {w.name}
                        </span>
                        <span className="block truncate text-xs text-ink-soft">
                          {w.role}
                        </span>
                      </span>
                    </span>
                    <span className="truncate text-sm text-ink-soft">
                      {company(w.company)}
                    </span>
                    <span className="flex flex-wrap gap-1.5">
                      {onSiteIds.has(w.id) && (
                        <Pill tone="neutral">On site</Pill>
                      )}
                      <Pill tone={h === "ok" ? "ok" : "owed"}>
                        {h === "expired"
                          ? "Ticket expired"
                          : h === "soon"
                            ? "Expiring"
                            : "Valid"}
                      </Pill>
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
                          Tickets and licences · {w.phone || "no phone"}
                        </p>
                        <button
                          type="button"
                          onClick={() => setTicketFor(w)}
                          className={`${btnLight} !px-3 !py-1.5 text-xs`}
                        >
                          <Icon name="plus" className="h-3.5 w-3.5" /> Add
                          ticket
                        </button>
                      </div>
                      {w.tickets.length === 0 ? (
                        <p className="text-sm text-ink-soft">
                          No tickets on file.
                        </p>
                      ) : (
                        <ul className="grid gap-2 sm:grid-cols-2">
                          {w.tickets.map((t) => {
                            const e = expiryOf(t.expires, s.settings.warnDays);
                            return (
                              <li
                                key={t.id}
                                className="flex items-start gap-3 rounded-xl border border-line bg-surface px-3 py-2.5"
                              >
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm font-semibold">
                                    {t.kind}
                                  </span>
                                  <span className="block truncate text-xs text-ink-soft">
                                    No. {t.number} ·{" "}
                                    {t.expires
                                      ? `exp. ${fmtDate(t.expires)}`
                                      : "no expiry"}
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
                                    ? "Expired"
                                    : e === "soon"
                                      ? `${daysUntil(t.expires as string)}d`
                                      : "Valid"}
                                </Pill>
                                <button
                                  type="button"
                                  aria-label={`Remove ${t.kind}`}
                                  onClick={() => s.removeTicket(w.id, t.id)}
                                  className="text-ink-soft hover:text-ink"
                                >
                                  <Icon name="close" className="h-4 w-4" />
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            window.confirm(
                              `Remove ${w.name} from the workforce?`,
                            ) && s.removeWorker(w.id)
                          }
                          className="text-xs font-semibold text-ink-soft underline hover:text-ink"
                        >
                          Remove worker
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {adding && <WorkerForm onClose={() => setAdding(false)} />}
      {ticketFor && (
        <TicketForm
          name={ticketFor.name}
          onClose={() => setTicketFor(null)}
          onSave={(t) => s.addTicket(ticketFor.id, t)}
        />
      )}
    </>
  );
}
