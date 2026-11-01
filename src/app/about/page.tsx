import type { Metadata } from "next";
import { Icon } from "@/components/Icons";
import { CtaBand, Eyebrow, PageHeader } from "@/components/Sections";
import { breadcrumbs, JsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About WHSCOMPLY, WHS Software for Builders",
  description:
    "WHSCOMPLY is built in Australia for the people who run building sites: SWMS, inductions, tickets and incidents that fill from the work. Powered by Briesa.",
  alternates: { canonical: "/about" },
};

const principles = [
  [
    "The record is sacred",
    "Compliance records are never hard-deleted, every write is audited, and history is not editable. If it happened, the file says so.",
  ],
  [
    "Built for the site, not the office",
    "If a foreman cannot use it in gloves, on a phone, at the gate, it does not ship.",
  ],
  [
    "Priced so hiring is free",
    "By project, never per head. Taking on another labourer should not be a budget conversation.",
  ],
  [
    "Built with builders",
    "Every part was checked against people who do the work, including the parts they told us were wrong.",
  ],
];

export default function About() {
  return (
    <>
      <JsonLd
        data={breadcrumbs(SITE_URL, [
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <PageHeader
        eyebrow="About WHSCOMPLY"
        title={
          <>
            Safety paperwork should not slow down a{" "}
            <span className="tape">pour</span>.
          </>
        }
      >
        Builders spend hours chasing paperwork that software should be chasing.
        WHSCOMPLY exists to make the safe thing the easy thing.
      </PageHeader>

      <section className="mx-auto mt-20 grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div data-reveal className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>Why we built it</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight">
            The site is the record.
          </h2>
        </div>
        <div data-reveal className="space-y-5 text-lg text-ink-soft">
          <p>
            A builder&apos;s safety evidence is created on site, yet most of it
            ends up in a clipboard, a shared drive or someone&apos;s phone. SWMS
            sit in one place, tickets in another and incident reports in a
            third.
          </p>
          <p>
            WHSCOMPLY puts the site first, with every signature, ticket,
            inspection and report filed against it as the work happens, instead
            of reconstructed before an audit.
          </p>
          <p>
            WHSCOMPLY is powered by Briesa, the Australian platform that holds
            the records and the audit log. It is owned and hosted in Australia.
          </p>
        </div>
      </section>

      <section className="mt-24 bg-ink py-20 text-bg">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div data-reveal>
            <Eyebrow>Powered by Briesa</Eyebrow>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1.02] tracking-tight">
              WHSCOMPLY runs on Briesa, the platform built in Australia.
            </h2>
            <div className="mt-6 max-w-md space-y-4 text-bg/75">
              <p>
                Briesa is the Australian platform underneath WHSCOMPLY. It holds
                the records, the documents and the audit log, and every
                WHSCOMPLY workspace is a Briesa workspace.
              </p>
              <p>
                That is why the same account signs you in, and why nothing in
                WHSCOMPLY is a bolt-on. The compliance records are the system of
                record, not a copy of one.
              </p>
            </div>
            <a
              href="https://briesa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-bg px-6 py-3 font-semibold text-ink transition-colors hover:bg-surface"
            >
              Visit Briesa <Icon name="arrow" className="h-4 w-4" />
            </a>
          </div>

          <div data-reveal>
            <h3 className="font-mono text-xs uppercase tracking-widest text-bg/60">
              What Briesa brings
            </h3>
            <dl data-stagger className="mt-4 border-t border-bg/20">
              {[
                [
                  "The site is the record",
                  "One record per project. SWMS, inductions, tickets and incidents attach to it, so history outlives any single job.",
                ],
                [
                  "Documents, kept properly",
                  "Insurances, licences and policies stored once, with expiry dates that drive the alerts.",
                ],
                [
                  "An audit log nothing escapes",
                  "Every write records who, when and the previous value. Compliance records are never hard-deleted.",
                ],
                [
                  "One core, shared",
                  "Teams, access levels, documents and the audit log are shared by every module.",
                ],
              ].map(([t, d]) => (
                <div key={t} className="border-b border-bg/20 py-5">
                  <dt className="font-display text-xl font-extrabold">{t}</dt>
                  <dd className="mt-1 text-bg/70">{d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <div data-reveal>
          <Eyebrow>Four things we will not compromise on</Eyebrow>
        </div>
        <ol className="mt-6 border-t border-ink">
          {principles.map(([t, d], i) => (
            <li
              key={t}
              data-reveal
              className="row-hover grid gap-3 border-b border-line py-8 md:grid-cols-[4rem_1fr_1.2fr] md:items-baseline"
            >
              <span className="font-mono text-sm text-ink-soft">0{i + 1}</span>
              <h3 className="font-display text-3xl font-extrabold leading-tight">
                {t}
              </h3>
              <p className="text-ink-soft">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section data-reveal className="mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <p className="max-w-3xl font-display text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-snug">
          Built for residential builders, commercial contractors, specialist
          subbies and the safety managers who keep every site cleared to work.
        </p>
      </section>

      <CtaBand />
    </>
  );
}
