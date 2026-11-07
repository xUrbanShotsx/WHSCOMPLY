"use client";

import { useState } from "react";
import {
  DRILL_KINDS,
  HAZARD_CLASSES,
  PERMIT_CHECKS,
  PLANT_KINDS,
  type PermitKind,
} from "@/lib/data";
import { addDays, type Doc } from "@/lib/data";
import { todayISO } from "@/lib/format";
import { useScope } from "./DemoStore";
import { Actions, fd, ProjectField, Shell } from "./forms";
import { Field, field } from "./ui";

/** A one-field dialog for "when was it done" and "when is it next due". */
export function DateModal({
  title,
  sub,
  label,
  initial,
  submit,
  onClose,
  onSave,
}: {
  title: string;
  sub?: string;
  label: string;
  initial: string;
  submit: string;
  onClose: () => void;
  onSave: (d: string) => void;
}) {
  return (
    <Shell title={title} sub={sub} onClose={onClose}>
      <form
        onSubmit={(e) => {
          const g = fd(e);
          onSave(g("date"));
          onClose();
        }}
      >
        <Field label={label}>
          <input
            name="date"
            type="date"
            required
            defaultValue={initial}
            className={field}
          />
        </Field>
        <Actions onClose={onClose} submit={submit} />
      </form>
    </Shell>
  );
}

export function PermitForm({ onClose }: { onClose: () => void }) {
  const { addPermit } = useScope();
  const [kind, setKind] = useState<PermitKind>("Hot work");
  return (
    <Shell
      title="Request a permit to work"
      sub="The checks below must all be ticked before the permit can be approved"
      onClose={onClose}
      wide
    >
      <form
        onSubmit={(e) => {
          const g = fd(e);
          addPermit({
            projectId: g("projectId"),
            kind,
            title: g("title"),
            location: g("location"),
            requestedBy: g("requestedBy"),
            issuedTo: g("issuedTo"),
            from: g("from"),
            until: g("until"),
          });
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="Type of permit" className="sm:col-span-2">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as PermitKind)}
            className={field}
          >
            {(Object.keys(PERMIT_CHECKS) as PermitKind[]).map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <ul className="rounded-xl border border-line bg-bg p-3 text-xs text-ink-soft sm:col-span-2">
          {PERMIT_CHECKS[kind].map((c) => (
            <li key={c} className="py-0.5">
              • {c}
            </li>
          ))}
        </ul>
        <Field label="Work to be done" className="sm:col-span-2">
          <input
            name="title"
            required
            className={field}
            placeholder="Cutting starter bars"
          />
        </Field>
        <ProjectField />
        <Field label="Location">
          <input name="location" required className={field} />
        </Field>
        <Field label="Requested by">
          <input
            name="requestedBy"
            required
            defaultValue="Sam Kowalski"
            className={field}
          />
        </Field>
        <Field label="Issued to">
          <input
            name="issuedTo"
            required
            className={field}
            placeholder="Person doing the work"
          />
        </Field>
        <Field label="Valid from">
          <input
            name="from"
            type="date"
            required
            defaultValue={todayISO()}
            className={field}
          />
        </Field>
        <Field label="Valid until">
          <input
            name="until"
            type="date"
            required
            defaultValue={todayISO()}
            className={field}
          />
        </Field>
        <div className="sm:col-span-2">
          <Actions onClose={onClose} submit="Request permit" />
        </div>
      </form>
    </Shell>
  );
}

export function PlantForm({ onClose }: { onClose: () => void }) {
  const { addPlant } = useScope();
  return (
    <Shell
      title="Add plant or equipment"
      sub="Cranes, EWPs, excavators, tools and leads"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          const g = fd(e);
          addPlant({
            projectId: g("projectId"),
            name: g("name"),
            kind: g("kind"),
            serial: g("serial"),
            owner: g("owner"),
            nextService: g("nextService"),
            tagDue: g("tagDue") || null,
          });
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="Name" className="sm:col-span-2">
          <input
            name="name"
            required
            className={field}
            placeholder="Scissor lift SL-4"
          />
        </Field>
        <ProjectField />
        <Field label="Type">
          <select name="kind" className={field}>
            {PLANT_KINDS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label="Serial or ID">
          <input name="serial" required className={field} />
        </Field>
        <Field label="Owner">
          <input name="owner" required defaultValue="Owned" className={field} />
        </Field>
        <Field label="Next service due">
          <input
            name="nextService"
            type="date"
            required
            defaultValue={addDays(90)}
            className={field}
          />
        </Field>
        <Field label="Test and tag due" hint="electrical only">
          <input name="tagDue" type="date" className={field} />
        </Field>
        <div className="sm:col-span-2">
          <Actions onClose={onClose} submit="Add to register" />
        </div>
      </form>
    </Shell>
  );
}

export function ChemicalForm({ onClose }: { onClose: () => void }) {
  const { addChemical } = useScope();
  return (
    <Shell
      title="Add a hazardous chemical"
      sub="Every chemical on site needs a current safety data sheet"
      onClose={onClose}
      wide
    >
      <form
        onSubmit={(e) => {
          const g = fd(e);
          const hasSds = g("hasSds") === "yes";
          addChemical({
            projectId: g("projectId"),
            name: g("name"),
            supplier: g("supplier"),
            hazard: g("hazard"),
            quantity: g("quantity"),
            location: g("location"),
            hasSds,
            sdsDate: hasSds ? g("sdsDate") || todayISO() : null,
            controls: g("controls"),
          });
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="Product name" className="sm:col-span-2">
          <input name="name" required className={field} />
        </Field>
        <ProjectField />
        <Field label="Supplier">
          <input name="supplier" required className={field} />
        </Field>
        <Field label="Hazard class">
          <select name="hazard" className={field}>
            {HAZARD_CLASSES.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label="Quantity on site">
          <input
            name="quantity"
            required
            className={field}
            placeholder="4 x 20 L"
          />
        </Field>
        <Field label="Stored at" className="sm:col-span-2">
          <input name="location" required className={field} />
        </Field>
        <Field label="Safety data sheet on file?">
          <select name="hasSds" defaultValue="yes" className={field}>
            <option value="yes">Yes</option>
            <option value="no">Not yet</option>
          </select>
        </Field>
        <Field label="SDS issue date" hint="if on file">
          <input name="sdsDate" type="date" className={field} />
        </Field>
        <Field label="Controls" className="sm:col-span-2">
          <textarea name="controls" required rows={3} className={field} />
        </Field>
        <div className="sm:col-span-2">
          <Actions onClose={onClose} submit="Add chemical" />
        </div>
      </form>
    </Shell>
  );
}

export function DrillForm({ onClose }: { onClose: () => void }) {
  const { addDrill } = useScope();
  return (
    <Shell title="Record an emergency check" onClose={onClose}>
      <form
        onSubmit={(e) => {
          const g = fd(e);
          addDrill({
            projectId: g("projectId"),
            kind: g("kind"),
            date: g("date"),
            by: g("by"),
            notes: g("notes"),
            nextDue: g("nextDue"),
          });
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="Type">
          <select name="kind" className={field}>
            {DRILL_KINDS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <ProjectField />
        <Field label="Date held">
          <input
            name="date"
            type="date"
            required
            defaultValue={todayISO()}
            className={field}
          />
        </Field>
        <Field label="Next due">
          <input
            name="nextDue"
            type="date"
            required
            defaultValue={addDays(90)}
            className={field}
          />
        </Field>
        <Field label="Run by" className="sm:col-span-2">
          <input
            name="by"
            required
            defaultValue="Sam Kowalski"
            className={field}
          />
        </Field>
        <Field label="What was found" hint="optional" className="sm:col-span-2">
          <textarea name="notes" rows={3} className={field} />
        </Field>
        <div className="sm:col-span-2">
          <Actions onClose={onClose} submit="Save record" />
        </div>
      </form>
    </Shell>
  );
}

export function VisitorForm({ onClose }: { onClose: () => void }) {
  const { signInVisitor } = useScope();
  return (
    <Shell
      title="Sign in a visitor"
      sub="Visitors are inducted to the site rules before they enter"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          const g = fd(e);
          signInVisitor({
            projectId: g("projectId"),
            name: g("name"),
            company: g("company"),
            purpose: g("purpose"),
            host: g("host"),
            inducted: g("inducted") === "yes",
          });
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="Full name">
          <input name="name" required className={field} />
        </Field>
        <Field label="Company">
          <input name="company" required className={field} />
        </Field>
        <ProjectField />
        <Field label="Purpose of visit">
          <input name="purpose" required className={field} />
        </Field>
        <Field label="Host on site">
          <input
            name="host"
            required
            defaultValue="Sam Kowalski"
            className={field}
          />
        </Field>
        <Field label="Visitor induction given?">
          <select name="inducted" defaultValue="yes" className={field}>
            <option value="yes">Yes</option>
            <option value="no">No, escorted at all times</option>
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Actions onClose={onClose} submit="Sign in" />
        </div>
      </form>
    </Shell>
  );
}

export function DocumentForm({ onClose }: { onClose: () => void }) {
  const { addDocument, projects } = useScope();
  return (
    <Shell
      title="Add a document"
      sub="Policies, procedures and plans that workers must read and sign"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          const g = fd(e);
          addDocument({
            projectId: g("projectId"),
            title: g("title"),
            category: g("category") as Doc["category"],
            version: g("version"),
            owner: g("owner"),
            reviewDue: g("reviewDue"),
          });
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="Title" className="sm:col-span-2">
          <input name="title" required className={field} />
        </Field>
        <Field label="Type">
          <select name="category" className={field}>
            {["Policy", "Procedure", "Plan", "Form"].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label="Applies to">
          <select name="projectId" defaultValue="all" className={field}>
            <option value="all">Whole business</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Version">
          <input name="version" required defaultValue="1.0" className={field} />
        </Field>
        <Field label="Owner">
          <input
            name="owner"
            required
            defaultValue="Sam Kowalski"
            className={field}
          />
        </Field>
        <Field label="Next review" className="sm:col-span-2">
          <input
            name="reviewDue"
            type="date"
            required
            defaultValue={addDays(365)}
            className={field}
          />
        </Field>
        <div className="sm:col-span-2">
          <Actions onClose={onClose} submit="Add document" />
        </div>
      </form>
    </Shell>
  );
}
