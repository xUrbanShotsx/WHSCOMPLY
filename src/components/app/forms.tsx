"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  addDays,
  CONSEQUENCE,
  DOC_KINDS,
  INSPECTION_TEMPLATES,
  LIKELIHOOD,
  RISK_CATEGORIES,
  TALK_TOPICS,
  TICKET_KINDS,
  rating,
  type IncidentType,
  type MeetingKind,
  type ProjectStatus,
  type RiskLevel,
} from "@/lib/data";
import { todayISO } from "@/lib/format";
import type {
  AiFile,
  IncidentDraft,
  RiskDraft,
  ScanNotes,
  ScanResult,
  SwmsDraft,
  TalkDraft,
} from "@/lib/ai-types";
import {
  AI_NOTE,
  aiBtn,
  AiPanel,
  AiProblem,
  Busy,
  FileButton,
  Sparkle,
  TextTools,
  useAi,
  useAiContext,
  VoiceButton,
} from "./ai";
import { Icon } from "../Icons";
import { useScope, type NewAction } from "./DemoStore";
import { Modal } from "./Modal";
import { btnDark, btnLight, Field, field, RiskPill } from "./ui";

export const fd = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const d = new FormData(e.currentTarget);
  return (k: string) => String(d.get(k) ?? "").trim();
};

export function Actions({
  onClose,
  submit,
}: {
  onClose: () => void;
  submit: string;
}) {
  return (
    <div className="mt-6 flex justify-end gap-2">
      <button type="button" onClick={onClose} className={btnLight}>
        Cancel
      </button>
      <button type="submit" className={btnDark}>
        {submit}
      </button>
    </div>
  );
}

/** A project picker that starts on the project chosen in the top bar. */
export function ProjectField({ name = "projectId" }: { name?: string }) {
  const { projects, scopeId, all } = useScope();
  return (
    <Field label="Project">
      <select
        name={name}
        required
        defaultValue={all ? "" : scopeId}
        className={field}
      >
        {all && (
          <option value="" disabled>
            Choose a project
          </option>
        )}
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Shell({
  title,
  sub,
  onClose,
  children,
  wide,
}: {
  title: string;
  sub?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Modal title={title} sub={sub} onClose={onClose} wide={wide}>
      {children}
    </Modal>
  );
}

/* ---------- projects ---------- */

export function ProjectForm({ onClose }: { onClose: () => void }) {
  const { addProject, setProject, settings } = useScope();
  return (
    <Shell
      title="New project"
      sub="Every record in the dashboard belongs to a project"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          const g = fd(e);
          const id = addProject({
            name: g("name"),
            address: g("address"),
            client: g("client"),
            stage: g("stage"),
            manager: g("manager"),
            status: g("status") as ProjectStatus,
          });
          setProject(id);
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="Project name" className="sm:col-span-2">
          <input
            name="name"
            required
            className={field}
            placeholder="22 Pine Court"
          />
        </Field>
        <Field label="Site address" className="sm:col-span-2">
          <input name="address" required className={field} />
        </Field>
        <Field label="Client">
          <input name="client" className={field} />
        </Field>
        <Field label="Current stage">
          <input name="stage" className={field} placeholder="Excavation" />
        </Field>
        <Field label="Site manager">
          <input
            name="manager"
            required
            defaultValue="Sam Kowalski"
            className={field}
          />
        </Field>
        <Field label="Status">
          <select name="status" defaultValue="Starting" className={field}>
            {["Starting", "Live", "Handover", "Complete"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <p className="text-xs text-ink-soft sm:col-span-2">
          Added to {settings.company.name}. You can assign workers and
          subcontractors to it afterwards.
        </p>
        <div className="sm:col-span-2">
          <Actions onClose={onClose} submit="Create project" />
        </div>
      </form>
    </Shell>
  );
}

/* ---------- SWMS ---------- */

const RISKS: RiskLevel[] = ["Low", "Medium", "High", "Extreme"];

export function SwmsForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated?: (id: string) => void;
}) {
  const { addSwms, scopeId, all, projects } = useScope();
  const ai = useAi();
  const [story, setStory] = useState("");
  const [title, setTitle] = useState("");
  const [highRisk, setHighRisk] = useState("yes");
  const [projectId, setProjectId] = useState(all ? "" : scopeId);
  const [drafted, setDrafted] = useState<
    { task: string; hazard: string; controls: string; risk: string }[]
  >([]);

  const draft = async () => {
    const r = await ai.run<SwmsDraft>("swms", {
      text: story,
      project: projects.find((p) => p.id === projectId)?.name ?? "",
    });
    if (!r || !r.steps.length) return;
    if (r.title) setTitle(r.title);
    setHighRisk(r.highRisk ? "yes" : "no");
    setDrafted(r.steps);
  };

  return (
    <Shell
      title="New SWMS"
      sub="Describe the work and let the AI draft the steps, or write the first step yourself."
      onClose={onClose}
      wide
    >
      <form
        onSubmit={(e) => {
          const g = fd(e);
          const steps = drafted.length
            ? drafted.map((x) => ({ ...x, risk: x.risk as RiskLevel }))
            : [
                {
                  task: g("task"),
                  hazard: g("hazard"),
                  controls: g("controls"),
                  risk: g("risk") as RiskLevel,
                },
              ];
          const id = addSwms({
            title: g("title"),
            projectId: g("projectId"),
            highRisk: g("highRisk") === "yes",
            owner: g("owner"),
            steps,
          });
          onCreated?.(id);
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <AiPanel
            title="Draft it with AI"
            hint="Describe the job in your own words. Include the location, equipment and who is involved."
          >
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={3}
              aria-label="Describe the work"
              placeholder="Re-sheeting the roof of a two storey townhouse, 6 m above ground, with a crew of 3 and a telehandler."
              className={field}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={ai.busy || story.trim().length < 10}
                onClick={() => void draft()}
                className={aiBtn}
              >
                <Sparkle /> Draft SWMS
              </button>
              <VoiceButton
                onText={(t) => setStory((v) => `${v}${v ? " " : ""}${t}`)}
              />
              {ai.busy && <Busy label="Drafting the steps" />}
            </div>
            <AiProblem problem={ai.problem} />
            {drafted.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">
                  {drafted.length} steps drafted. {AI_NOTE}
                </p>
                <ol className="space-y-2">
                  {drafted.map((st, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-line bg-surface p-3 text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold">
                          {i + 1}. {st.task}
                        </p>
                        <span className="flex items-center gap-2">
                          <RiskPill level={st.risk} />
                          <button
                            type="button"
                            aria-label={`Remove step ${i + 1}`}
                            onClick={() =>
                              setDrafted(drafted.filter((_, k) => k !== i))
                            }
                            className="text-ink-soft hover:text-ink"
                          >
                            <Icon name="close" className="h-4 w-4" />
                          </button>
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-ink-soft">
                        <span className="font-semibold text-ink">Hazard:</span>{" "}
                        {st.hazard}
                      </p>
                      <p className="mt-1 text-xs text-ink-soft">
                        <span className="font-semibold text-ink">
                          Controls:
                        </span>{" "}
                        {st.controls}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </AiPanel>
        </div>

        <Field label="Title" className="sm:col-span-2">
          <input
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={field}
            placeholder="Roof sheeting at height"
          />
        </Field>
        <Field label="Project">
          <select
            name="projectId"
            required
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className={field}
          >
            {all && (
              <option value="" disabled>
                Choose a project
              </option>
            )}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Owner">
          <input
            name="owner"
            required
            defaultValue="Sam Kowalski"
            className={field}
          />
        </Field>
        <Field
          label="Is this high risk construction work?"
          className="sm:col-span-2"
        >
          <select
            name="highRisk"
            value={highRisk}
            onChange={(e) => setHighRisk(e.target.value)}
            className={field}
          >
            <option value="yes">Yes, a SWMS is required</option>
            <option value="no">No, a voluntary SWMS</option>
          </select>
        </Field>

        {drafted.length === 0 && (
          <>
            <Field label="First task" className="sm:col-span-2">
              <input name="task" required className={field} />
            </Field>
            <Field label="Hazard">
              <input name="hazard" required className={field} />
            </Field>
            <Field label="Risk before controls">
              <select name="risk" defaultValue="High" className={field}>
                {RISKS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="Controls" className="sm:col-span-2">
              <textarea name="controls" required rows={3} className={field} />
            </Field>
          </>
        )}
        <div className="sm:col-span-2">
          <Actions onClose={onClose} submit="Create SWMS" />
        </div>
      </form>
    </Shell>
  );
}

export function StepForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (s: {
    task: string;
    hazard: string;
    controls: string;
    risk: RiskLevel;
  }) => void;
}) {
  return (
    <Shell
      title="Add a step"
      sub="Adding or removing a step clears the signatures, so the crew signs the new method."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          const g = fd(e);
          onSave({
            task: g("task"),
            hazard: g("hazard"),
            controls: g("controls"),
            risk: g("risk") as RiskLevel,
          });
          onClose();
        }}
        className="grid gap-4"
      >
        <Field label="Task">
          <input name="task" required className={field} />
        </Field>
        <Field label="Hazard">
          <input name="hazard" required className={field} />
        </Field>
        <Field label="Risk before controls">
          <select name="risk" defaultValue="Medium" className={field}>
            {RISKS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
        <Field label="Controls">
          <textarea name="controls" required rows={3} className={field} />
        </Field>
        <Actions onClose={onClose} submit="Add step" />
      </form>
    </Shell>
  );
}

/* ---------- risk register ---------- */

type RiskDefaults = {
  hazard?: string;
  category?: string;
  likelihood?: number;
  consequence?: number;
  controls?: string;
  resL?: number;
  resC?: number;
  owner?: string;
  review?: string;
  projectId?: string;
};

export function RiskForm({
  onClose,
  initial,
  onSave,
}: {
  onClose: () => void;
  initial?: RiskDefaults;
  onSave?: (v: {
    hazard: string;
    category: string;
    likelihood: number;
    consequence: number;
    controls: string;
    resL: number;
    resC: number;
    owner: string;
    review: string;
    projectId: string;
  }) => void;
}) {
  const { addRisk, all } = useScope();
  const ai = useAi();
  const [hazard, setHazard] = useState(initial?.hazard ?? "");
  const [category, setCategory] = useState(
    initial?.category ?? RISK_CATEGORIES[0],
  );
  const [controls, setControls] = useState(initial?.controls ?? "");
  const [l, setL] = useState(initial?.likelihood ?? 3);
  const [c, setC] = useState(initial?.consequence ?? 3);
  const [rl, setRl] = useState(initial?.resL ?? 2);
  const [rc, setRc] = useState(initial?.resC ?? 3);
  const editing = !!onSave;

  const suggest = async () => {
    const r = await ai.run<RiskDraft>("risk", { hazard });
    if (!r) return;
    setCategory(r.category);
    setL(r.likelihood);
    setC(r.consequence);
    setRl(r.resL);
    setRc(r.resC);
    setControls(r.controls);
  };

  const scale = (
    name: string,
    value: number,
    set: (n: number) => void,
    labels: string[],
  ) => (
    <select
      name={name}
      value={value}
      onChange={(e) => set(Number(e.target.value))}
      className={field}
    >
      {labels.map((t, i) => (
        <option key={t} value={i + 1}>
          {i + 1}. {t}
        </option>
      ))}
    </select>
  );

  return (
    <Shell
      title={editing ? "Edit risk" : "Add a risk"}
      sub="Rated on a 5 by 5 matrix: likelihood times consequence"
      onClose={onClose}
      wide
    >
      <form
        onSubmit={(e) => {
          const g = fd(e);
          const v = {
            hazard,
            category,
            likelihood: l,
            consequence: c,
            controls,
            resL: rl,
            resC: rc,
            owner: g("owner"),
            review: g("review"),
            projectId: g("projectId") || initial?.projectId || "",
          };
          if (onSave) onSave(v);
          else addRisk({ ...v, status: "Open" });
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="Hazard" className="sm:col-span-2">
          <input
            name="hazard"
            required
            value={hazard}
            onChange={(e) => setHazard(e.target.value)}
            className={field}
            placeholder="Unprotected edge on the roof"
          />
        </Field>
        <div className="sm:col-span-2">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-accent/40 bg-accent/[0.07] px-4 py-3">
            <Sparkle />
            <p className="min-w-0 flex-1 text-xs text-ink-soft">
              Let the AI suggest the category, ratings and controls. {AI_NOTE}
            </p>
            <button
              type="button"
              disabled={ai.busy || hazard.trim().length < 5}
              onClick={() => void suggest()}
              className={aiBtn}
            >
              Suggest
            </button>
            {ai.busy && <Busy label="Assessing" />}
          </div>
          <div className="mt-2">
            <AiProblem problem={ai.problem} />
          </div>
        </div>
        {editing ? (
          <input type="hidden" name="projectId" value={initial?.projectId} />
        ) : (
          <ProjectField />
        )}
        <Field label="Category">
          <select
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={field}
          >
            {RISK_CATEGORIES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>

        <div className="rounded-2xl border border-line bg-bg p-4 sm:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Before controls</p>
            <RiskPill level={rating(l, c)} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Likelihood">{scale("l", l, setL, LIKELIHOOD)}</Field>
            <Field label="Consequence">
              {scale("c", c, setC, CONSEQUENCE)}
            </Field>
          </div>
        </div>

        <Field label="Controls in place" className="sm:col-span-2">
          <textarea
            name="controls"
            required
            rows={3}
            value={controls}
            onChange={(e) => setControls(e.target.value)}
            className={field}
          />
        </Field>

        <div className="rounded-2xl border border-line bg-bg p-4 sm:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">After controls (residual)</p>
            <RiskPill level={rating(rl, rc)} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Likelihood">
              {scale("rl", rl, setRl, LIKELIHOOD)}
            </Field>
            <Field label="Consequence">
              {scale("rc", rc, setRc, CONSEQUENCE)}
            </Field>
          </div>
        </div>

        <Field label="Owner">
          <input
            name="owner"
            required
            defaultValue={initial?.owner ?? "Sam Kowalski"}
            className={field}
          />
        </Field>
        <Field label="Next review">
          <input
            name="review"
            type="date"
            required
            defaultValue={initial?.review ?? todayISO()}
            className={field}
          />
        </Field>
        {all && !editing && (
          <p className="text-xs text-ink-soft sm:col-span-2">
            Pick the project the risk belongs to. Switching the top bar to one
            project fills this in for you.
          </p>
        )}
        <div className="sm:col-span-2">
          <Actions
            onClose={onClose}
            submit={editing ? "Save risk" : "Add risk"}
          />
        </div>
      </form>
    </Shell>
  );
}

/* ---------- toolbox talks ---------- */

export function TalkForm({
  onClose,
  kinds = ["Toolbox talk"],
}: {
  onClose: () => void;
  kinds?: MeetingKind[];
}) {
  const { addTalk } = useScope();
  const ai = useAi();
  const context = useAiContext();
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const single = kinds.length === 1;
  const noun = single ? kinds[0].toLowerCase() : "meeting";

  const draft = async () => {
    const r = await ai.run<TalkDraft>("talk", { topic, context: context() });
    if (!r) return;
    if (r.topic && !topic.trim()) setTopic(r.topic);
    setNotes(r.notes);
  };

  return (
    <Shell
      title={`Schedule a ${noun}`}
      sub="Everyone assigned to the project is added to the attendance list"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          const g = fd(e);
          addTalk({
            kind: (g("kind") || kinds[0]) as MeetingKind,
            projectId: g("projectId"),
            topic: g("topic"),
            date: g("date"),
            presenter: g("presenter"),
            notes,
          });
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {!single && (
          <Field label="Type" className="sm:col-span-2">
            <select name="kind" defaultValue={kinds[0]} className={field}>
              {kinds.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </Field>
        )}
        <Field label={single ? "Topic" : "Subject"} className="sm:col-span-2">
          <input
            name="topic"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            list={single ? "talk-topics" : undefined}
            className={field}
            placeholder={
              single
                ? "Choose or type a topic"
                : "Monthly WHS committee meeting"
            }
          />
          <datalist id="talk-topics">
            {TALK_TOPICS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </Field>
        <ProjectField />
        <Field label="Date">
          <input
            name="date"
            type="date"
            required
            defaultValue={todayISO()}
            className={field}
          />
        </Field>
        <Field label={single ? "Presenter" : "Chair"} className="sm:col-span-2">
          <input
            name="presenter"
            required
            defaultValue="Sam Kowalski"
            className={field}
          />
        </Field>
        <div className="sm:col-span-2">
          <div className="mb-2 flex flex-wrap items-center gap-3 rounded-2xl border border-accent/40 bg-accent/[0.07] px-4 py-3">
            <Sparkle />
            <p className="min-w-0 flex-1 text-xs text-ink-soft">
              {single
                ? "Write the talk from the topic and what has happened on this project recently."
                : "Draft an agenda from the topic and recent site events."}{" "}
              {AI_NOTE}
            </p>
            <button
              type="button"
              disabled={ai.busy || topic.trim().length < 3}
              onClick={() => void draft()}
              className={aiBtn}
            >
              Draft
            </button>
            {ai.busy && <Busy label="Writing" />}
          </div>
          <AiProblem problem={ai.problem} />
          <Field
            label={single ? "Key points" : "Agenda"}
            hint="optional"
            className="mt-3"
          >
            <textarea
              name="notes"
              rows={notes ? 9 : 3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={field}
            />
          </Field>
          <div className="mt-2">
            <TextTools value={notes} onChange={setNotes} />
          </div>
        </div>
        <div className="sm:col-span-2">
          <Actions onClose={onClose} submit="Schedule" />
        </div>
      </form>
    </Shell>
  );
}

/* ---------- inspections ---------- */

export function InspectionStartForm({
  onClose,
  onStarted,
}: {
  onClose: () => void;
  onStarted: (id: string) => void;
}) {
  const { startInspection, customTemplates } = useScope();
  return (
    <Shell
      title="Start an inspection"
      sub="Pick a checklist. Failed items raise a corrective action automatically."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          const g = fd(e);
          const id = startInspection(g("projectId"), g("kind"), g("inspector"));
          onClose();
          onStarted(id);
        }}
        className="grid gap-4"
      >
        <ProjectField />
        <Field label="Checklist">
          <select name="kind" className={field} defaultValue="Daily site walk">
            {[
              ...Object.keys(INSPECTION_TEMPLATES),
              ...customTemplates.map((t) => t.name),
            ].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label="Inspector">
          <input
            name="inspector"
            required
            defaultValue="Sam Kowalski"
            className={field}
          />
        </Field>
        <Actions onClose={onClose} submit="Start inspection" />
      </form>
    </Shell>
  );
}

/* ---------- incidents ---------- */

const INCIDENT_TYPES: IncidentType[] = [
  "Near miss",
  "Hazard",
  "First aid",
  "Injury",
  "Property damage",
  "Dangerous incident",
];

export function IncidentForm({
  onClose,
  onReported,
}: {
  onClose: () => void;
  onReported?: (id: string) => void;
}) {
  const { reportIncident, addAction, scopeId, all, projects } = useScope();
  const ai = useAi();
  const [story, setStory] = useState("");
  const [v, setV] = useState({
    title: "",
    type: "Near miss",
    severity: "Medium",
    projectId: all ? "" : scopeId,
    location: "",
    date: todayISO(),
    time: "09:00",
    reporter: "Sam Kowalski",
    people: "",
    description: "",
  });
  const [hint, setHint] = useState<{
    reason: string;
    notifiable: boolean | null;
  } | null>(null);
  const [acts, setActs] = useState<{ t: string; on: boolean }[]>([]);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) =>
    setV((p) => ({ ...p, [k]: e.target.value }));

  const fill = async () => {
    const r = await ai.run<IncidentDraft>("incident", {
      text: story,
      today: todayISO(),
    });
    if (!r) return;
    setV((p) => ({
      ...p,
      title: r.title || p.title,
      type: r.type,
      severity: r.severity,
      location: r.location || p.location,
      people: r.people || p.people,
      description: r.description || p.description,
      date: r.date || p.date,
      time: r.time || p.time,
    }));
    setHint({ reason: r.notifiableReason, notifiable: r.notifiable });
    setActs(r.actions.map((t) => ({ t, on: true })));
  };

  return (
    <Shell
      title="Report an incident"
      sub="Talk it through, photograph handwritten notes or type it. The AI fills in the report."
      onClose={onClose}
      wide
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const id = reportIncident({
            projectId: v.projectId,
            type: v.type as IncidentType,
            title: v.title,
            date: v.date,
            time: v.time,
            location: v.location,
            reporter: v.reporter,
            people: v.people,
            description: v.description,
            severity: v.severity as RiskLevel,
          });
          for (const a of acts.filter((x) => x.on))
            addAction({
              projectId: v.projectId,
              title: a.t,
              source: "Incident",
              sourceLabel: v.title,
              owner: v.reporter,
              due: addDays(3),
            });
          onReported?.(id);
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <AiPanel
            title="Describe it and let the AI fill the report"
            hint="Speak it, photograph notes, or type it. Include what happened, where and who was nearby."
          >
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={3}
              aria-label="What happened"
              placeholder="A pallet of bricks slipped off the hoist on Level 2 this morning around 10. Landed in the exclusion zone, nobody under it. Ryan saw it."
              className={field}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={ai.busy || story.trim().length < 10}
                onClick={() => void fill()}
                className={aiBtn}
              >
                <Sparkle /> Fill the report
              </button>
              <VoiceButton
                onText={(t) => setStory((x) => `${x}${x ? " " : ""}${t}`)}
              />
              <FileButton
                label="Scan notes"
                accept="image/*"
                disabled={ai.busy}
                onError={(m) => ai.setProblem({ code: "file", message: m })}
                onFile={async (f) => {
                  const r = await ai.run<ScanNotes>("scanNotes", {}, f);
                  if (r?.text) setStory((x) => `${x}${x ? "\n" : ""}${r.text}`);
                }}
              />
              {ai.busy && <Busy label="Working" />}
            </div>
            <AiProblem problem={ai.problem} />
            {hint && (
              <div className="rounded-xl border border-line bg-surface p-3 text-sm">
                <p className="font-semibold">
                  {hint.notifiable === true
                    ? "This may be notifiable to the regulator"
                    : hint.notifiable === false
                      ? "Probably not notifiable"
                      : "Notifiability is unclear"}
                </p>
                {hint.reason && (
                  <p className="mt-0.5 text-xs text-ink-soft">{hint.reason}</p>
                )}
                <p className="mt-1 text-xs text-ink-soft">
                  {AI_NOTE} Confirm with your state regulator.
                </p>
              </div>
            )}
            {acts.length > 0 && (
              <fieldset>
                <legend className="mb-1 text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Raise these corrective actions too
                </legend>
                <ul className="space-y-1.5">
                  {acts.map((a, i) => (
                    <li key={i}>
                      <label className="flex cursor-pointer items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={a.on}
                          onChange={(e) =>
                            setActs(
                              acts.map((x, k) =>
                                k === i ? { ...x, on: e.target.checked } : x,
                              ),
                            )
                          }
                          className="mt-1 accent-[var(--ink)]"
                        />
                        {a.t}
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            )}
          </AiPanel>
        </div>

        <Field label="What happened, in a line" className="sm:col-span-2">
          <input
            required
            value={v.title}
            onChange={set("title")}
            className={field}
            placeholder="Tie dropped from Level 3"
          />
        </Field>
        <Field label="Type">
          <select value={v.type} onChange={set("type")} className={field}>
            {INCIDENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Severity">
          <select
            value={v.severity}
            onChange={set("severity")}
            className={field}
          >
            {RISKS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
        <Field label="Project">
          <select
            required
            value={v.projectId}
            onChange={set("projectId")}
            className={field}
          >
            {all && (
              <option value="" disabled>
                Choose a project
              </option>
            )}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Location on site">
          <input
            required
            value={v.location}
            onChange={set("location")}
            className={field}
            placeholder="Level 3, grid C4"
          />
        </Field>
        <Field label="Date">
          <input
            type="date"
            required
            value={v.date}
            onChange={set("date")}
            className={field}
          />
        </Field>
        <Field label="Time">
          <input
            type="time"
            required
            value={v.time}
            onChange={set("time")}
            className={field}
          />
        </Field>
        <Field label="Reported by">
          <input
            required
            value={v.reporter}
            onChange={set("reporter")}
            className={field}
          />
        </Field>
        <Field label="People involved" hint="optional">
          <input value={v.people} onChange={set("people")} className={field} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description">
            <textarea
              required
              rows={4}
              value={v.description}
              onChange={set("description")}
              className={field}
            />
          </Field>
          <div className="mt-2">
            <TextTools
              value={v.description}
              onChange={(t) => setV((p) => ({ ...p, description: t }))}
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <Actions onClose={onClose} submit="Report incident" />
        </div>
      </form>
    </Shell>
  );
}

/* ---------- actions ---------- */

export function ActionForm({
  onClose,
  fixed,
  onSave,
}: {
  onClose: () => void;
  /** When set, the action is tied to a record (an incident, say) and the project is not asked for. */
  fixed?: {
    projectId: string;
    source: NewAction["source"];
    sourceLabel: string;
  };
  onSave?: (a: NewAction) => void;
}) {
  const { addAction } = useScope();
  return (
    <Shell title="New corrective action" onClose={onClose}>
      <form
        onSubmit={(e) => {
          const g = fd(e);
          (onSave ?? addAction)({
            projectId: fixed?.projectId ?? g("projectId"),
            title: g("title"),
            source: fixed?.source ?? "Manual",
            sourceLabel: fixed?.sourceLabel ?? "Raised manually",
            owner: g("owner"),
            due: g("due"),
          });
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="Action" className="sm:col-span-2">
          <input name="title" required className={field} />
        </Field>
        {!fixed && <ProjectField />}
        <Field label="Owner">
          <input
            name="owner"
            required
            defaultValue="Sam Kowalski"
            className={field}
          />
        </Field>
        <Field label="Due">
          <input
            name="due"
            type="date"
            required
            defaultValue={todayISO()}
            className={field}
          />
        </Field>
        <div className="sm:col-span-2">
          <Actions onClose={onClose} submit="Add action" />
        </div>
      </form>
    </Shell>
  );
}

/* ---------- people ---------- */

export function WorkerForm({ onClose }: { onClose: () => void }) {
  const { addWorker, subs, scopeId, all, projects } = useScope();
  return (
    <Shell
      title="Add a worker"
      sub="Add their white card and licences once they are on file"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          const g = fd(e);
          const picked = projects
            .filter((p) => g(`p-${p.id}`) === "on")
            .map((p) => p.id);
          addWorker({
            name: g("name"),
            role: g("role"),
            company: g("company"),
            phone: g("phone"),
            projects: picked,
          });
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="Full name">
          <input name="name" required className={field} />
        </Field>
        <Field label="Role or trade">
          <input name="role" required className={field} />
        </Field>
        <Field label="Employer">
          <select name="company" defaultValue="own" className={field}>
            <option value="own">Direct employee</option>
            {subs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Mobile" hint="optional">
          <input name="phone" className={field} />
        </Field>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium">Assigned projects</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {projects.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm has-[:checked]:border-ink has-[:checked]:bg-tint"
              >
                <input
                  type="checkbox"
                  name={`p-${p.id}`}
                  defaultChecked={all ? false : p.id === scopeId}
                  className="accent-[var(--ink)]"
                />
                {p.name}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="sm:col-span-2">
          <Actions onClose={onClose} submit="Add worker" />
        </div>
      </form>
    </Shell>
  );
}

const nearest = (v: string, list: string[]) => {
  const n = v.toLowerCase();
  const words = n.split(/[^a-z]+/).filter((w) => w.length > 3);
  let best = "";
  let score = 0;
  for (const l of list) {
    const t = l.toLowerCase();
    const sc =
      (t.includes(n) || n.includes(t) ? 5 : 0) +
      words.filter((w) => t.includes(w)).length;
    if (sc > score) {
      score = sc;
      best = l;
    }
  }
  return best;
};

export function TicketForm({
  name,
  onClose,
  onSave,
}: {
  name: string;
  onClose: () => void;
  onSave: (t: { kind: string; number: string; expires: string | null }) => void;
}) {
  const ai = useAi();
  const [kind, setKind] = useState(TICKET_KINDS[0]);
  const [number, setNumber] = useState("");
  const [expires, setExpires] = useState("");
  const [note, setNote] = useState("");

  const scan = async (f: AiFile) => {
    const r = await ai.run<ScanResult>("scan", {}, f);
    if (!r) return;
    const match = nearest(r.kind, TICKET_KINDS);
    setKind(match || r.kind || TICKET_KINDS[0]);
    setNumber(r.number);
    setExpires(r.expires ?? "");
    const first = name.toLowerCase().split(/\s+/)[0];
    const warn =
      r.holder && first && !r.holder.toLowerCase().includes(first)
        ? `The name on the document is "${r.holder}", which does not look like ${name}. Check it is the right card. `
        : "";
    setNote(`${warn}${r.notes}`.trim());
  };

  return (
    <Shell
      title={`Add a ticket for ${name}`}
      sub="White cards do not expire. Leave the date blank."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ kind, number, expires: expires || null });
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <AiPanel
            title="Scan the card"
            hint="Photograph a white card, licence or certificate and the AI reads the details."
          >
            <div className="flex flex-wrap items-center gap-2">
              <FileButton
                label="Photograph or upload"
                disabled={ai.busy}
                onFile={scan}
                onError={(m) => ai.setProblem({ code: "file", message: m })}
              />
              {ai.busy && <Busy label="Reading the card" />}
            </div>
            <AiProblem problem={ai.problem} />
            {note && (
              <p className="rounded-xl border border-line bg-surface p-3 text-xs">
                {note} {AI_NOTE}
              </p>
            )}
          </AiPanel>
        </div>
        <Field label="Ticket or licence" className="sm:col-span-2">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className={field}
          >
            {[
              ...(TICKET_KINDS.includes(kind) ? [] : [kind]),
              ...TICKET_KINDS,
            ].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label="Number">
          <input
            required
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className={field}
          />
        </Field>
        <Field label="Expiry" hint="optional">
          <input
            type="date"
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
            className={field}
          />
        </Field>
        <div className="sm:col-span-2">
          <Actions onClose={onClose} submit="Save ticket" />
        </div>
      </form>
    </Shell>
  );
}

export function SubForm({ onClose }: { onClose: () => void }) {
  const { addSub, scopeId, all, projects } = useScope();
  return (
    <Shell
      title="Add a subcontractor"
      sub="They stay pending until their paperwork is checked and you approve them"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          const g = fd(e);
          addSub({
            name: g("name"),
            trade: g("trade"),
            contact: g("contact"),
            phone: g("phone"),
            projects: projects
              .filter((p) => g(`p-${p.id}`) === "on")
              .map((p) => p.id),
          });
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="Business name">
          <input name="name" required className={field} />
        </Field>
        <Field label="Trade">
          <input name="trade" required className={field} />
        </Field>
        <Field label="Contact">
          <input name="contact" required className={field} />
        </Field>
        <Field label="Phone" hint="optional">
          <input name="phone" className={field} />
        </Field>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium">Working on</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {projects.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm has-[:checked]:border-ink has-[:checked]:bg-tint"
              >
                <input
                  type="checkbox"
                  name={`p-${p.id}`}
                  defaultChecked={all ? false : p.id === scopeId}
                  className="accent-[var(--ink)]"
                />
                {p.name}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="sm:col-span-2">
          <Actions onClose={onClose} submit="Add subcontractor" />
        </div>
      </form>
    </Shell>
  );
}

export function DocForm({
  name,
  onClose,
  onSave,
}: {
  name: string;
  onClose: () => void;
  onSave: (d: { kind: string; expires: string | null }) => void;
}) {
  const ai = useAi();
  const [kind, setKind] = useState(DOC_KINDS[0]);
  const [expires, setExpires] = useState("");
  const [note, setNote] = useState("");

  const scan = async (f: AiFile) => {
    const r = await ai.run<ScanResult>("scan", {}, f);
    if (!r) return;
    setKind(nearest(r.kind, DOC_KINDS) || DOC_KINDS[0]);
    setExpires(r.expires ?? "");
    const first = name.toLowerCase().split(/\s+/)[0];
    const warn =
      r.holder && first && !r.holder.toLowerCase().includes(first)
        ? `The insured name is "${r.holder}", which does not match ${name}. `
        : "";
    setNote(`${warn}${r.notes}`.trim());
  };

  return (
    <Shell title={`Add a document for ${name}`} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ kind, expires: expires || null });
          onClose();
        }}
        className="grid gap-4"
      >
        <AiPanel
          title="Scan the certificate"
          hint="Photograph or upload an insurance or workers' compensation certificate and the AI reads the expiry."
        >
          <div className="flex flex-wrap items-center gap-2">
            <FileButton
              label="Photograph or upload"
              disabled={ai.busy}
              onFile={scan}
              onError={(m) => ai.setProblem({ code: "file", message: m })}
            />
            {ai.busy && <Busy label="Reading the document" />}
          </div>
          <AiProblem problem={ai.problem} />
          {note && (
            <p className="rounded-xl border border-line bg-surface p-3 text-xs">
              {note} {AI_NOTE}
            </p>
          )}
        </AiPanel>
        <Field label="Document">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className={field}
          >
            {DOC_KINDS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label="Expiry" hint="optional">
          <input
            type="date"
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
            className={field}
          />
        </Field>
        <Actions onClose={onClose} submit="Save document" />
      </form>
    </Shell>
  );
}
