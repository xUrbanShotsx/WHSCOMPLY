"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { useScope } from "@/components/app/DemoStore";
import { Actions, fd, ProjectField, Shell } from "@/components/app/forms";
import {
  btnDark,
  btnLight,
  Card,
  Chips,
  EmptyState,
  Field,
  field,
  PageHeading,
  Pill,
} from "@/components/app/ui";
import { addDays, daysUntil, type Rfi } from "@/lib/data";

const FILTERS = ["Open", "Answered", "Closed", "All"] as const;

export default function RfisPage() {
  const s = useScope();
  const [f, setF] = useState<(typeof FILTERS)[number]>("Open");
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const list = s.rfisIn
    .filter((r) => f === "All" || r.status === f)
    .sort((a, b) => b.number.localeCompare(a.number));

  const nextNumber = (projectId: string) => {
    const n = s.rfis.filter((r) => r.projectId === projectId).length + 1;
    return `RFI-${String(n + 10).padStart(3, "0")}`;
  };

  const answer = (r: Rfi, text: string) =>
    s.patch(
      "rfis",
      r.id,
      { answer: text, status: "Answered" },
      {
        area: "RFIs",
        projectId: r.projectId,
        act: `recorded the answer to ${r.number}`,
        from: "Open",
        to: "Answered",
      },
    );

  return (
    <>
      <PageHeading
        title="RFIs"
        sub="Raise a request for information, chase it to an answer and keep the reply on the record. Unanswered RFIs on safety details hold up the work."
        actions={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={btnDark}
          >
            <Icon name="plus" className="h-4 w-4" /> Raise RFI
          </button>
        }
      />
      <Card>
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <Chips value={f} options={[...FILTERS]} onChange={setF} />
          <span className="text-xs text-ink-soft">
            {list.length} RFI{list.length === 1 ? "" : "s"}
          </span>
        </div>
        {list.length === 0 ? (
          <EmptyState title="No RFIs here." />
        ) : (
          <ul>
            {list.map((r) => {
              const n = daysUntil(r.due);
              const isOpen = open === r.id;
              return (
                <li key={r.id} className="border-b border-line last:border-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : r.id)}
                    className="grid w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-tint/60 md:grid-cols-[6rem_1.7fr_1fr_auto]"
                  >
                    <span className="font-mono text-sm font-semibold">
                      {r.number}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {r.subject}
                      </span>
                      <span className="block truncate text-xs text-ink-soft">
                        {s.all &&
                          `${s.projects.find((p) => p.id === r.projectId)?.name} · `}
                        To {r.to} · raised by {r.raisedBy}
                      </span>
                    </span>
                    <span className="flex flex-wrap gap-2">
                      <Pill
                        tone={
                          r.status === "Open"
                            ? "owed"
                            : r.status === "Answered"
                              ? "neutral"
                              : "ok"
                        }
                      >
                        {r.status}
                      </Pill>
                      {r.status === "Open" && (
                        <Pill tone={n < 0 ? "owed" : "neutral"}>
                          {n < 0 ? `Overdue ${-n}d` : `Due in ${n}d`}
                        </Pill>
                      )}
                    </span>
                    <Icon
                      name="arrow"
                      className={`h-4 w-4 justify-self-end text-ink-soft transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="space-y-4 border-t border-line bg-bg px-5 py-4 text-sm">
                      <div>
                        <p className="mb-0.5 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                          Question
                        </p>
                        <p>{r.question}</p>
                      </div>
                      {r.answer ? (
                        <div>
                          <p className="mb-0.5 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                            Answer
                          </p>
                          <p>{r.answer}</p>
                        </div>
                      ) : (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const v = String(
                              new FormData(e.currentTarget).get("answer") ?? "",
                            ).trim();
                            if (v) answer(r, v);
                          }}
                          className="space-y-2"
                        >
                          <label className="block text-sm font-medium">
                            Record the answer
                            <textarea
                              name="answer"
                              rows={3}
                              required
                              className={field}
                            />
                          </label>
                          <button
                            type="submit"
                            className={`${btnDark} !px-3 !py-1.5 text-xs`}
                          >
                            Save answer
                          </button>
                        </form>
                      )}
                      <div className="flex items-center justify-between">
                        {r.status === "Answered" ? (
                          <button
                            type="button"
                            onClick={() =>
                              s.patch(
                                "rfis",
                                r.id,
                                { status: "Closed" },
                                {
                                  area: "RFIs",
                                  projectId: r.projectId,
                                  act: `closed ${r.number}`,
                                  from: "Answered",
                                  to: "Closed",
                                },
                              )
                            }
                            className={`${btnLight} !px-3 !py-1.5 text-xs`}
                          >
                            Close RFI
                          </button>
                        ) : (
                          <span />
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            window.confirm("Delete this RFI?") &&
                            s.remove("rfis", r.id)
                          }
                          className="text-xs font-semibold text-ink-soft underline hover:text-ink"
                        >
                          Delete
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

      {adding && (
        <Shell title="Raise an RFI" onClose={() => setAdding(false)}>
          <form
            onSubmit={(e) => {
              const g = fd(e);
              s.add(
                "rfis",
                {
                  projectId: g("projectId"),
                  number: nextNumber(g("projectId")),
                  subject: g("subject"),
                  question: g("question"),
                  raisedBy: g("raisedBy"),
                  to: g("to"),
                  due: g("due"),
                  status: "Open",
                  answer: "",
                },
                {
                  area: "RFIs",
                  projectId: g("projectId"),
                  act: `raised an RFI: ${g("subject")}`,
                  to: "Open",
                },
              );
              setAdding(false);
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <Field label="Subject" className="sm:col-span-2">
              <input name="subject" required className={field} />
            </Field>
            <ProjectField />
            <Field label="Directed to">
              <input
                name="to"
                required
                className={field}
                placeholder="Structural engineer"
              />
            </Field>
            <Field label="Raised by">
              <input
                name="raisedBy"
                required
                defaultValue="Sam Kowalski"
                className={field}
              />
            </Field>
            <Field label="Answer needed by">
              <input
                name="due"
                type="date"
                required
                defaultValue={addDays(5)}
                className={field}
              />
            </Field>
            <Field label="Question" className="sm:col-span-2">
              <textarea name="question" required rows={4} className={field} />
            </Field>
            <div className="sm:col-span-2">
              <Actions onClose={() => setAdding(false)} submit="Raise RFI" />
            </div>
          </form>
        </Shell>
      )}
    </>
  );
}
