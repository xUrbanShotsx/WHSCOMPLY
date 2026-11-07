"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import {
  AI_NOTE,
  aiBtn,
  AiPanel,
  AiProblem,
  Busy,
  Sparkle,
  useAi,
  VoiceButton,
} from "@/components/app/ai";
import { AttachField } from "@/components/app/Attachments";
import { useScope } from "@/components/app/DemoStore";
import { Actions, Shell } from "@/components/app/forms";
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
import type { DefectDraft } from "@/lib/ai-types";
import {
  addDays,
  DEFECT_FLOW,
  daysUntil,
  type Defect,
  type DefectPriority,
  type DefectStatus,
} from "@/lib/data";
import type { Attachment } from "@/lib/files";
import { fmtDate, todayISO } from "@/lib/format";

const PRIORITIES: DefectPriority[] = ["Low", "Medium", "High", "Critical"];
const FILTERS = ["Open", "All", "Closed"] as const;

function DefectForm({ onClose }: { onClose: () => void }) {
  const s = useScope();
  const ai = useAi();
  const [story, setStory] = useState("");
  const [projectId, setProjectId] = useState(s.all ? "" : s.scopeId);
  const [v, setV] = useState({
    title: "",
    description: "",
    location: "",
    priority: "Medium",
    assignee: "",
    due: addDays(7),
  });
  const [files, setFiles] = useState<Attachment[]>([]);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) =>
    setV((p) => ({ ...p, [k]: e.target.value }));
  const proj = s.projects.find((p) => p.id === projectId);
  const assignees = [
    ...s.subs.map((x) => x.name),
    proj?.manager ?? "",
    "Own crew",
  ].filter(Boolean);

  const fill = async () => {
    const r = await ai.run<DefectDraft>("defect", { text: story, assignees });
    if (!r) return;
    setV((p) => ({
      ...p,
      title: r.title || p.title,
      description: r.description || p.description,
      location: r.location || p.location,
      priority: r.priority,
      assignee: r.assignee || p.assignee,
      due: addDays(r.days),
    }));
  };

  return (
    <Shell
      title="Log a defect"
      sub="Say it on site and the AI fills in the record, or type it yourself."
      onClose={onClose}
      wide
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          s.add(
            "defects",
            {
              projectId,
              title: v.title,
              description: v.description,
              location: v.location,
              priority: v.priority as DefectPriority,
              assignee: v.assignee,
              due: v.due,
              raised: todayISO(),
              raisedBy: "Sam Kowalski",
              status: "Open",
              files,
            },
            {
              area: "Defects",
              projectId,
              act: `logged the defect ${v.title}`,
              to: "Open",
            },
          );
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <AiPanel
            title="Describe the defect"
            hint="Include where it is and who should fix it."
          >
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={2}
              aria-label="Describe the defect"
              placeholder="Cracked tile in the ensuite, unit 12, high priority, Ridgeline to fix by Friday."
              className={field}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={ai.busy || story.trim().length < 8}
                onClick={() => void fill()}
                className={aiBtn}
              >
                <Sparkle /> Fill the record
              </button>
              <VoiceButton
                onText={(t) => setStory((x) => `${x}${x ? " " : ""}${t}`)}
              />
              {ai.busy && <Busy label="Working" />}
            </div>
            <AiProblem problem={ai.problem} />
            <p className="text-xs text-ink-soft">{AI_NOTE}</p>
          </AiPanel>
        </div>
        <Field label="Title" className="sm:col-span-2">
          <input
            required
            value={v.title}
            onChange={set("title")}
            className={field}
          />
        </Field>
        <Field label="Project">
          <select
            required
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className={field}
          >
            {s.all && (
              <option value="" disabled>
                Choose a project
              </option>
            )}
            {s.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Location">
          <input
            required
            list="defect-locations"
            value={v.location}
            onChange={set("location")}
            className={field}
          />
          <datalist id="defect-locations">
            {(proj?.locations ?? []).map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </Field>
        <Field label="Priority">
          <select
            value={v.priority}
            onChange={set("priority")}
            className={field}
          >
            {PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="Assigned to">
          <input
            required
            list="defect-assignees"
            value={v.assignee}
            onChange={set("assignee")}
            className={field}
          />
          <datalist id="defect-assignees">
            {assignees.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </Field>
        <Field label="Due">
          <input
            type="date"
            required
            value={v.due}
            onChange={set("due")}
            className={field}
          />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <textarea
            required
            rows={3}
            value={v.description}
            onChange={set("description")}
            className={field}
          />
        </Field>
        <div className="sm:col-span-2">
          <p className="mb-1 text-sm font-medium">Photos</p>
          <AttachField files={files} onChange={setFiles} />
        </div>
        <div className="sm:col-span-2">
          <Actions onClose={onClose} submit="Log defect" />
        </div>
      </form>
    </Shell>
  );
}

export default function DefectsPage() {
  const s = useScope();
  const [f, setF] = useState<(typeof FILTERS)[number]>("Open");
  const [adding, setAdding] = useState(false);

  const list = s.defectsIn
    .filter(
      (d) =>
        f === "All" ||
        (f === "Closed" ? d.status === "Closed" : d.status !== "Closed"),
    )
    .sort(
      (a, b) =>
        PRIORITIES.indexOf(b.priority) - PRIORITIES.indexOf(a.priority) ||
        a.due.localeCompare(b.due),
    );

  const move = (d: Defect, to: DefectStatus) =>
    s.patch(
      "defects",
      d.id,
      { status: to },
      {
        area: "Defects",
        projectId: d.projectId,
        act: `moved the defect ${d.title} to ${to}`,
        from: d.status,
        to,
      },
    );

  return (
    <>
      <PageHeading
        title="Defects"
        sub="Log and close defects, with photos, a location and someone responsible. Critical ones, such as missing edge protection, rise to the top."
        actions={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={btnDark}
          >
            <Icon name="plus" className="h-4 w-4" /> Log defect
          </button>
        }
      />
      <Card>
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <Chips value={f} options={[...FILTERS]} onChange={setF} />
          <span className="text-xs text-ink-soft">
            {list.length} defect{list.length === 1 ? "" : "s"}
          </span>
        </div>
        {list.length === 0 ? (
          <EmptyState
            title="No defects here."
            body="Log defects as you find them so each one has an owner and a due date."
          />
        ) : (
          <ul>
            {list.map((d) => {
              const n = daysUntil(d.due);
              const crit = d.priority === "Critical" || d.priority === "High";
              const next = DEFECT_FLOW[DEFECT_FLOW.indexOf(d.status) + 1];
              return (
                <li
                  key={d.id}
                  className={`border-b border-line px-5 py-4 last:border-0 ${d.priority === "Critical" && d.status !== "Closed" ? "bg-accent/[0.07] shadow-[inset_3px_0_0_var(--accent)]" : ""}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{d.title}</p>
                      <p className="text-xs text-ink-soft">
                        {s.all &&
                          `${s.projects.find((p) => p.id === d.projectId)?.name} · `}
                        {d.location} · {d.assignee} · raised {fmtDate(d.raised)}{" "}
                        by {d.raisedBy}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Pill tone={crit ? "owed" : "neutral"}>{d.priority}</Pill>
                      <Pill tone={d.status === "Closed" ? "ok" : "neutral"}>
                        {d.status}
                      </Pill>
                      {d.status !== "Closed" && (
                        <Pill tone={n < 0 ? "owed" : "neutral"}>
                          {n < 0 ? `Overdue ${-n}d` : `Due ${fmtDate(d.due)}`}
                        </Pill>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-ink-soft">{d.description}</p>
                  <div className="mt-3 space-y-3">
                    <AttachField
                      files={d.files}
                      onChange={(files) => s.patch("defects", d.id, { files })}
                      disabled={d.status === "Closed"}
                      label="Add photos"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      {next && (
                        <button
                          type="button"
                          onClick={() => move(d, next)}
                          className={`${btnDark} !px-3 !py-1.5 text-xs`}
                        >
                          Move to {next}
                        </button>
                      )}
                      {d.status === "Closed" && (
                        <button
                          type="button"
                          onClick={() => move(d, "Open")}
                          className={`${btnLight} !px-3 !py-1.5 text-xs`}
                        >
                          Reopen
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          window.confirm("Delete this defect?") &&
                          s.remove("defects", d.id)
                        }
                        className="ml-auto text-xs font-semibold text-ink-soft underline hover:text-ink"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      {adding && <DefectForm onClose={() => setAdding(false)} />}
    </>
  );
}
