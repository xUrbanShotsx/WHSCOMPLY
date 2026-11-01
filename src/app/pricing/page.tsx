import type { Metadata } from "next";
import { Icon } from "@/components/Icons";
import { PricingGrid } from "@/components/PricingGrid";
import { CtaBand, Eyebrow, PageHeader } from "@/components/Sections";
import { breadcrumbs, faqPage, JsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing by Project, Never Per Worker",
  description:
    "WHSCOMPLY is priced by project, not per worker. Plans for subcontractors, builders and groups. Book a demo for a quote.",
  alternates: { canonical: "/pricing" },
};

const faqs = [
  [
    "Do you charge per worker?",
    "No. Pricing follows the number of projects you run. Every worker, subcontractor and site manager has an account of their own.",
  ],
  [
    "How is the price worked out?",
    "By how many sites you run and what you need on them. Book a demo and we will quote you on the call.",
  ],
  [
    "Can we change plan later?",
    "Yes. A plan is a limit, not a different system, so nothing is migrated when you move up or down.",
  ],
  [
    "Does an inspector need a seat?",
    "No. An inspector or client you invite gets a free read-only account that sees everything and changes nothing.",
  ],
  [
    "Can we bring our existing SWMS and tickets?",
    "Yes. We help you bring SWMS, worker details and licence dates across so you are not retyping them.",
  ],
];

export default function Pricing() {
  return (
    <>
      <JsonLd
        data={[
          faqPage(faqs.map(([q, a]) => ({ q, a }))),
          breadcrumbs(SITE_URL, [
            { name: "Home", path: "/" },
            { name: "Pricing", path: "/pricing" },
          ]),
        ]}
      />
      <PageHeader
        eyebrow="Pricing"
        title={
          <>
            Priced by project, never per <span className="tape">worker</span>.
          </>
        }
      >
        Tell us how many sites you run and we will quote you. Hover a plan to
        compare.
      </PageHeader>

      <ul
        data-reveal
        className="mx-auto mt-10 flex max-w-6xl flex-wrap gap-x-8 gap-y-3 px-5 font-semibold sm:px-8"
      >
        {[
          "No per-worker charges",
          "Inspector access is free",
          "Bring your existing records",
        ].map((t) => (
          <li key={t} className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-ink">
              <Icon name="check" className="h-3.5 w-3.5" />
            </span>
            {t}
          </li>
        ))}
      </ul>

      <PricingGrid />

      <section className="mx-auto mt-24 grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div data-reveal>
          <Eyebrow>Questions</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight">
            Before you ask.
          </h2>
        </div>
        <div data-reveal className="border-t border-ink">
          {faqs.map(([q, a]) => (
            <details key={q} className="group border-b border-line py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl font-bold">
                {q}
                <span className="font-mono text-lg transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-lg text-ink-soft">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
