"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon, type IconName } from "./Icons";

type Plan = {
  name: string;
  icon: IconName;
  blurb: string;
  badge?: string;
  top: string[];
  lead: string;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Subcontractor",
    icon: "user",
    blurb: "For a small business with a crew and a few sites.",
    top: [
      "Never charged per worker",
      "SWMS library and gate sign-on",
      "Incident and near miss reports",
    ],
    lead: "What's included:",
    features: [
      "Unlimited workers and tickets",
      "Licence and white card alerts before expiry",
      "Toolbox talks with attendance",
      "Insurance and WorkCover dates tracked",
      "Audit pack export",
    ],
  },
  {
    name: "Builder",
    icon: "store",
    blurb: "For a builder running several live projects.",
    badge: "Popular",
    top: [
      "Never charged per worker",
      "Every live site on one board",
      "Subcontractor prequalification",
    ],
    lead: "Everything in Subcontractor, for the whole business:",
    features: [
      "Site inductions with sign-on and sign-off",
      "Inspections and corrective actions",
      "Approved subcontractor list per project",
      "Read-only access for inspectors and clients",
      "Priority support",
    ],
  },
  {
    name: "Group",
    icon: "building",
    blurb: "For a multi-site builder with a safety team.",
    top: [
      "Never charged per worker",
      "Roles and approvals across sites",
      "Reporting by site, trade and period",
    ],
    lead: "Everything in Builder:",
    features: [
      "Company-wide compliance reporting",
      "Bulk import of workers and subcontractors",
      "Single sign-on",
      "Onboarding and migration help",
      "A named contact",
    ],
  },
];

const DEFAULT = "Builder";

export function PricingGrid() {
  const [active, setActive] = useState(DEFAULT);

  return (
    <div
      data-stagger
      className="mx-auto mt-14 grid max-w-6xl items-stretch gap-6 px-5 sm:px-8 md:grid-cols-3"
      onMouseLeave={() => setActive(DEFAULT)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setActive(DEFAULT);
      }}
    >
      {plans.map((p) => {
        const on = active === p.name;
        return (
          <article
            key={p.name}
            onMouseEnter={() => setActive(p.name)}
            onFocus={() => setActive(p.name)}
            className={`flex flex-col rounded-[2rem] border p-8 transition-all duration-300 ease-out ${
              on
                ? "z-10 border-ink bg-ink text-bg shadow-[0_30px_70px_-30px_oklch(0.23_0.02_255/0.6)] md:-translate-y-2 md:scale-[1.04]"
                : "border-line bg-surface"
            }`}
          >
            <div className="flex items-start justify-between">
              <span className={on ? "text-accent" : "text-ink"}>
                <Icon name={p.icon} className="h-9 w-9" />
              </span>
              {p.badge && (
                <span className="rounded-full bg-accent px-3 py-1 font-mono text-[0.65rem] font-medium uppercase tracking-widest text-ink">
                  {p.badge}
                </span>
              )}
            </div>

            <h2 className="mt-6 font-display text-3xl font-extrabold tracking-tight">
              {p.name}
            </h2>
            <p
              className={`mt-2 min-h-12 text-sm ${on ? "text-bg/75" : "text-ink-soft"}`}
            >
              {p.blurb}
            </p>

            <p className="mt-6 font-display text-4xl font-extrabold tracking-tight">
              Quote
            </p>
            <p
              className={`mt-1 text-sm ${on ? "text-bg/75" : "text-ink-soft"}`}
            >
              Priced by project, never per worker
            </p>

            <Link
              href="/demo"
              className={`mt-7 rounded-xl px-5 py-3.5 text-center font-semibold transition-colors duration-200 ${
                on
                  ? "bg-bg text-ink hover:bg-surface"
                  : "bg-ink text-bg hover:bg-ink/85"
              }`}
            >
              Book a demo
            </Link>

            <hr className={`my-7 ${on ? "border-bg/20" : "border-line"}`} />

            <ul className="space-y-3 font-medium">
              {p.top.map((t) => (
                <li key={t} className="flex gap-3">
                  <span
                    className={`mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full ${on ? "bg-accent" : "bg-ink"}`}
                  />
                  {t}
                </li>
              ))}
            </ul>

            <p className="mt-7 font-bold">{p.lead}</p>
            <ul
              className={`mt-4 space-y-3 text-sm ${on ? "text-bg/80" : "text-ink-soft"}`}
            >
              {p.features.map((f) => (
                <li key={f} className="flex gap-3">
                  <Icon
                    name="check"
                    className={`mt-0.5 h-4 w-4 shrink-0 ${on ? "text-accent" : "text-ink"}`}
                  />
                  {f}
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}
