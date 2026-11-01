import type { Metadata } from "next";
import { ButtonLink, CtaBand, PageHeader } from "@/components/Sections";

export const metadata: Metadata = { title: "Pricing | WHSCOMPLY" };

const plans = [
  [
    "Subcontractor",
    "One business, a handful of sites.",
    [
      "SWMS library and sign-on",
      "Tickets and licence alerts",
      "Incident reports",
    ],
  ],
  [
    "Builder",
    "For builders running several live projects.",
    [
      "Everything in Subcontractor",
      "Subcontractor prequalification",
      "Inspections and corrective actions",
      "Audit pack export",
    ],
  ],
  [
    "Group",
    "For multi-site builders with a safety team.",
    [
      "Everything in Builder",
      "Roles and approvals across sites",
      "Read-only access for inspectors",
      "Onboarding and migration help",
    ],
  ],
];

export default function Pricing() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title={
          <>
            Priced by <span className="tape">project</span>, not per worker.
          </>
        }
      >
        Tell us how many sites you run and we will quote you. No per-seat
        charges for the crew.
      </PageHeader>
      <section className="mx-auto mt-16 grid max-w-6xl gap-6 px-5 sm:px-8 lg:grid-cols-3">
        {plans.map(([name, blurb, items]) => (
          <div
            key={name as string}
            data-reveal
            className="flex flex-col rounded-2xl border border-line bg-surface p-7"
          >
            <h2 className="font-display text-3xl font-extrabold">
              {name as string}
            </h2>
            <p className="mt-2 text-ink-soft">{blurb as string}</p>
            <p className="mt-6 font-mono text-xs uppercase tracking-widest text-ink-soft">
              Quote on request
            </p>
            <ul className="mt-6 flex-1 divide-y divide-line border-y border-line text-sm font-medium">
              {(items as string[]).map((i) => (
                <li key={i} className="py-3">
                  {i}
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <ButtonLink href="mailto:hello@whscomply.com">
                Book a demo
              </ButtonLink>
            </div>
          </div>
        ))}
      </section>
      <CtaBand />
    </>
  );
}
