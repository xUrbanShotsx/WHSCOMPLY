"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { CONTACT_EMAIL } from "@/lib/site";

const field =
  "mt-1 w-full rounded-lg border border-line bg-bg px-3 py-3 text-ink focus:border-ink";

export function DemoForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div
        role="status"
        className="rounded-3xl border border-line bg-surface p-8 text-center"
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-ink">
          <Icon name="check" className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-ink">
          Your email app should have opened
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Send the pre-filled message to {CONTACT_EMAIL} and we will reach out
          to schedule your demo.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        const g = (k: string) => String(d.get(k) ?? "");
        const body = [
          `Name: ${g("name")}`,
          `Email: ${g("email")}`,
          `Company: ${g("company")}`,
          `Sites running: ${g("sites")}`,
          `Plan of interest: ${g("plan")}`,
          "",
          g("notes"),
        ].join("\n");
        // No backend yet: hand the request to the visitor's email app.
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("WHSCOMPLY demo request")}&body=${encodeURIComponent(body)}`;
        setSent(true);
      }}
      className="rounded-3xl border border-line bg-surface p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          Full name
          <input name="name" required autoComplete="name" className={field} />
        </label>
        <label className="text-sm font-medium text-ink">
          Work email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={field}
          />
        </label>
        <label className="text-sm font-medium text-ink">
          Company
          <input
            name="company"
            required
            autoComplete="organization"
            className={field}
          />
        </label>
        <label className="text-sm font-medium text-ink">
          Sites you run
          <select name="sites" defaultValue="" required className={field}>
            <option value="" disabled>
              Select a range
            </option>
            <option>1</option>
            <option>2-5</option>
            <option>6-20</option>
            <option>20+</option>
          </select>
        </label>
        <label className="text-sm font-medium text-ink sm:col-span-2">
          Plan of interest
          <select name="plan" defaultValue="Not sure yet" className={field}>
            <option>Subcontractor</option>
            <option>Builder</option>
            <option>Group</option>
            <option>Not sure yet</option>
          </select>
        </label>
        <label className="text-sm font-medium text-ink sm:col-span-2">
          Anything we should know?{" "}
          <span className="font-normal text-ink-soft">(optional)</span>
          <textarea name="notes" rows={4} className={field} />
        </label>
      </div>
      <button
        type="submit"
        className="mt-6 w-full cursor-pointer rounded-full bg-ink px-6 py-3.5 font-semibold text-bg transition-colors duration-200 hover:bg-ink/85"
      >
        Request a demo
      </button>
    </form>
  );
}
