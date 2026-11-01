import type { Metadata } from "next";
import { CtaBand, PageHeader } from "@/components/Sections";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Guides and checklists for builders and safety managers: SWMS, site setup, subcontractor tickets and incident reports.",
  alternates: { canonical: "/resources" },
};

const items = [
  ["Guide", "What a SWMS needs to contain before work starts"],
  ["Checklist", "Setting up a new site: induction, signage and sign-on"],
  ["Guide", "Keeping subcontractor tickets and insurances current"],
  ["Template", "Incident and near miss report, step by step"],
];

export default function Resources() {
  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title={
          <>
            Guides for the <span className="tape">site office</span>.
          </>
        }
      >
        Practical material for builders and safety managers. Coming soon.
      </PageHeader>
      <section className="mx-auto mt-16 max-w-6xl px-5 sm:px-8">
        <ul data-stagger className="divide-y divide-line border-y border-line">
          {items.map(([k, t]) => (
            <li key={t} className="row-hover flex items-baseline gap-6 py-4">
              <span className="w-24 shrink-0 font-mono text-xs uppercase tracking-widest text-ink-soft">
                {k}
              </span>
              <span className="font-medium">{t}</span>
            </li>
          ))}
        </ul>
      </section>
      <CtaBand />
    </>
  );
}
