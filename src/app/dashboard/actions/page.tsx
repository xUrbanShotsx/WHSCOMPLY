"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { useScope } from "@/components/app/DemoStore";
import { ActionForm } from "@/components/app/forms";
import {
  Avatar,
  btnDark,
  Card,
  Chips,
  EmptyState,
  PageHeading,
  Pill,
} from "@/components/app/ui";
import { daysUntil } from "@/lib/data";
import { fmtDate } from "@/lib/format";

const FILTERS = ["Open", "Overdue", "Done", "All"] as const;

export default function ActionsPage() {
  const s = useScope();
  const [f, setF] = useState<(typeof FILTERS)[number]>("Open");
  const [adding, setAdding] = useState(false);

  const list = s.actionsIn
    .filter((a) =>
      f === "All"
        ? true
        : f === "Done"
          ? a.status === "Done"
          : f === "Overdue"
            ? a.status === "Open" && daysUntil(a.due) < 0
            : a.status === "Open",
    )
    .sort((a, b) => a.due.localeCompare(b.due));

  return (
    <>
      <PageHeading
        title="Corrective actions"
        sub="Everything raised from incidents, inspections and risks, with an owner and a due date, until it is done."
        actions={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={btnDark}
          >
            <Icon name="plus" className="h-4 w-4" /> New action
          </button>
        }
      />
      <Card>
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <Chips value={f} options={[...FILTERS]} onChange={setF} />
          <span className="text-xs text-ink-soft">
            {list.length} action{list.length === 1 ? "" : "s"}
          </span>
        </div>
        {list.length === 0 ? (
          <EmptyState
            title={f === "Done" ? "Nothing is done yet." : "No actions here."}
            body="Failed inspection items and incident follow-ups appear here automatically."
          />
        ) : (
          <ul>
            {list.map((a) => {
              const d = daysUntil(a.due);
              const done = a.status === "Done";
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-3 border-b border-line px-5 py-3.5 last:border-0"
                >
                  <button
                    type="button"
                    aria-label={done ? "Reopen action" : "Mark action done"}
                    onClick={() => s.toggleAction(a.id)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] ${done ? "border-ink bg-ink text-bg" : "border-ink-soft/50 hover:border-ink"}`}
                  >
                    {done && <Icon name="check" className="h-3 w-3" />}
                  </button>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-sm ${done ? "text-ink-soft line-through" : "font-semibold"}`}
                    >
                      {a.title}
                    </span>
                    <span className="block truncate text-xs text-ink-soft">
                      {s.all &&
                        `${s.projects.find((p) => p.id === a.projectId)?.name} · `}
                      {a.source}: {a.sourceLabel}
                    </span>
                  </span>
                  {!done && (
                    <Pill tone={d < 0 ? "owed" : "neutral"}>
                      {d < 0
                        ? `Overdue ${-d}d`
                        : d === 0
                          ? "Due today"
                          : fmtDate(a.due)}
                    </Pill>
                  )}
                  <Avatar
                    initials={a.owner
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                    tone={1}
                  />
                  <button
                    type="button"
                    aria-label={`Delete ${a.title}`}
                    onClick={() =>
                      window.confirm("Delete this action?") &&
                      s.removeAction(a.id)
                    }
                    className="hidden h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-tint hover:text-ink sm:flex"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      {adding && <ActionForm onClose={() => setAdding(false)} />}
    </>
  );
}
