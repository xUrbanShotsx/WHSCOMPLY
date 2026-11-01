import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icons";
import { CtaBand, Eyebrow, PageHeader } from "@/components/Sections";
import { topics } from "@/lib/content";
import { breadcrumbs, JsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "WHS Resources and Guides for Builders",
  description:
    "Guides and checklists for builders and safety managers: SWMS, site inductions, subcontractor tickets, incident reports and audit packs. General information, not legal advice.",
  alternates: { canonical: "/resources" },
};

const kinds = [
  "Guide",
  "Checklist",
  "Guide",
  "Template",
  "Checklist",
  "Guide",
  "Checklist",
  "Guide",
];

export default function Resources() {
  const [lead, ...rest] = topics;
  return (
    <>
      <JsonLd
        data={breadcrumbs(SITE_URL, [
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
        ])}
      />
      <PageHeader
        eyebrow="Resources"
        title={
          <>
            Guides and checklists for people who run{" "}
            <span className="tape">sites</span>.
          </>
        }
      >
        Plain-language material on the safety paperwork a builder answers for.
        None of it is legal advice.
      </PageHeader>

      <section className="mx-auto mt-16 grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
        <article
          data-reveal
          className="flex flex-col justify-between rounded-3xl bg-ink p-8 text-bg sm:p-10 lg:min-h-96"
        >
          <Eyebrow>Start here</Eyebrow>
          <div className="mt-16">
            <h2 className="font-display text-[clamp(2rem,3.6vw,3rem)] font-extrabold leading-[1.02] tracking-tight">
              {lead.h1}
            </h2>
            <p className="mt-4 max-w-sm text-bg/75">{lead.description}</p>
            <Link
              href={`/solutions/${lead.slug}`}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-semibold text-ink"
            >
              Read the guide <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
        </article>

        <ul data-stagger className="border-t border-ink">
          {rest.map((t, i) => (
            <li key={t.slug} className="border-b border-line">
              <Link
                href={`/solutions/${t.slug}`}
                className="row-hover block py-6"
              >
                <span className="eyebrow">{kinds[i + 1]}</span>
                <h3 className="mt-2 font-display text-2xl font-extrabold leading-tight">
                  {t.h1}
                </h3>
                <p className="mt-1 max-w-md text-sm text-ink-soft">
                  {t.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <CtaBand />
    </>
  );
}
