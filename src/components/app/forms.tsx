"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
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
  const { addSwms } = useScope();
  return (
    <Shell
      title="New SWMS"
      sub="Start with the first high risk step. You can add more on the next screen."
      onClose={onClose}
      wide
    >
      <form
        onSubmit={(e) => {
          const g = fd(e);
          const id = addSwms({
            title: g("title"),
            projectId: g("projectId"),
            highRisk: g("highRisk") === "yes",
            owner: g("owner"),
            steps: [
              {
                task: g("task"),
                hazard: g("hazard"),
                controls: g("controls"),
                risk: g("risk") as RiskLevel,
              },
            ],
          });
          onCreated?.(id);
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="Title" className="sm:col-span-2">
          <input
            name="title"
            required
            className={field}
            placeholder="Roof sheeting at height"
          />
        </Field>
        <ProjectField />
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
          <select name="highRisk" defaultValue="yes" className={field}>
            <option value="yes">Yes, a SWMS is required</option>
            <option value="no">No, a voluntary SWMS</option>
          </select>
        </Field>
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
  const [l, setL] = useState(initial?.likelihood ?? 3);
  const [c, setC] = useState(initial?.consequence ?? 3);
  const [rl, setRl] = useState(initial?.resL ?? 2);
  const [rc, setRc] = useState(initial?.resC ?? 3);
  const editing = !!onSave;

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
            hazard: g("hazard"),
            category: g("category"),
            likelihood: l,
            consequence: c,
            controls: g("controls"),
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
            defaultValue={initial?.hazard}
            className={field}
            placeholder="Unprotected edge on the roof"
          />
        </Field>
        {editing ? (
          <input type="hidden" name="projectId" value={initial?.projectId} />
        ) : (
          <ProjectField />
        )}
        <Field label="Category">
          <select
            name="category"
            defaultValue={initial?.category ?? RISK_CATEGORIES[0]}
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
            defaultValue={initial?.controls}
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
  const single = kinds.length === 1;
  const noun = single ? kinds[0].toLowerCase() : "meeting";
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
            notes: g("notes"),
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
        <Field
          label={single ? "Key points" : "Agenda"}
          hint="optional"
          className="sm:col-span-2"
        >
          <textarea name="notes" rows={3} className={field} />
        </Field>
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
  const { startInspection } = useScope();
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
            {Object.keys(INSPECTION_TEMPLATES).map((k) => (
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
  const { reportIncident } = useScope();
  return (
    <Shell
      title="Report an incident"
      sub="Takes about a minute. You can add the investigation afterwards."
      onClose={onClose}
      wide
    >
      <form
        onSubmit={(e) => {
          const g = fd(e);
          const id = reportIncident({
            projectId: g("projectId"),
            type: g("type") as IncidentType,
            title: g("title"),
            date: g("date"),
            time: g("time"),
            location: g("location"),
            reporter: g("reporter"),
            people: g("people"),
            description: g("description"),
            severity: g("severity") as RiskLevel,
          });
          onReported?.(id);
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="What happened, in a line" className="sm:col-span-2">
          <input
            name="title"
            required
            className={field}
            placeholder="Tie dropped from Level 3"
          />
        </Field>
        <Field label="Type">
          <select name="type" defaultValue="Near miss" className={field}>
            {INCIDENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Severity">
          <select name="severity" defaultValue="Medium" className={field}>
            {RISKS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
        <ProjectField />
        <Field label="Location on site">
          <input
            name="location"
            required
            className={field}
            placeholder="Level 3, grid C4"
          />
        </Field>
        <Field label="Date">
          <input
            name="date"
            type="date"
            required
            defaultValue={todayISO()}
            className={field}
          />
        </Field>
        <Field label="Time">
          <input
            name="time"
            type="time"
            required
            defaultValue="09:00"
            className={field}
          />
        </Field>
        <Field label="Reported by">
          <input
            name="reporter"
            required
            defaultValue="Sam Kowalski"
            className={field}
          />
        </Field>
        <Field label="People involved" hint="optional">
          <input name="people" className={field} />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <textarea name="description" required rows={4} className={field} />
        </Field>
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

export function TicketForm({
  name,
  onClose,
  onSave,
}: {
  name: string;
  onClose: () => void;
  onSave: (t: { kind: string; number: string; expires: string | null }) => void;
}) {
  return (
    <Shell
      title={`Add a ticket for ${name}`}
      sub="White cards do not expire. Leave the date blank."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          const g = fd(e);
          onSave({
            kind: g("kind"),
            number: g("number"),
            expires: g("expires") || null,
          });
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="Ticket or licence" className="sm:col-span-2">
          <select name="kind" className={field}>
            {TICKET_KINDS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label="Number">
          <input name="number" required className={field} />
        </Field>
        <Field label="Expiry" hint="optional">
          <input name="expires" type="date" className={field} />
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
  return (
    <Shell title={`Add a document for ${name}`} onClose={onClose}>
      <form
        onSubmit={(e) => {
          const g = fd(e);
          onSave({ kind: g("kind"), expires: g("expires") || null });
          onClose();
        }}
        className="grid gap-4"
      >
        <Field label="Document">
          <select name="kind" className={field}>
            {DOC_KINDS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label="Expiry" hint="optional">
          <input name="expires" type="date" className={field} />
        </Field>
        <Actions onClose={onClose} submit="Save document" />
      </form>
    </Shell>
  );
}
