import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand, PageHeader } from "@/components/Sections";
import { breadcrumbs, JsonLd } from "@/lib/jsonld";
import { stateBySlug, states, topics } from "@/lib/content";
import { LAST_UPDATED, SITE_NAME, SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return states.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/states/[state]">): Promise<Metadata> {
  const s = stateBySlug((await params).state);
  if (!s) return {};
  const title = `WHS Compliance Software for Builders in ${s.name}`;
  const description = `SWMS, inductions, licences and incident reports for ${s.code} builders. Keep records ready for ${s.regulator} in ${s.cities[0]} and across ${s.name}.`;
  return {
    title,
    description,
    alternates: { canonical: `/states/${s.slug}` },
    openGraph: { title, description, url: `/states/${s.slug}` },
  };
}

export default async function StatePage({
  params,
}: PageProps<"/states/[state]">) {
  const s = stateBySlug((await params).state);
  if (!s) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbs(SITE_URL, [
          { name: "Home", path: "/" },
          { name: "States", path: "/states" },
          { name: s.name, path: `/states/${s.slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `WHS compliance software for builders in ${s.name}`,
          url: `${SITE_URL}/states/${s.slug}`,
          dateModified: LAST_UPDATED,
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
          about: {
            "@type": "SoftwareApplication",
            name: SITE_NAME,
            applicationCategory: "BusinessApplication",
            areaServed: { "@type": "AdministrativeArea", name: s.name },
          },
        }}
      />
      <PageHeader
        eyebrow={`${s.name} builders`}
        title={`WHS compliance software for builders in ${s.name}`}
      >
        {s.note} WHSCOMPLY keeps the paperwork behind it, from SWMS to incident
        reports, ready to show {s.regulator}.
      </PageHeader>

      <section className="mx-auto mt-16 grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-extrabold leading-[1.05] tracking-tight">
            What {s.code} builders need to show
          </h2>
          <dl className="mt-8 divide-y divide-line border-y border-line">
            <div className="py-4">
              <dt className="font-mono text-xs uppercase tracking-widest text-ink-soft">
                Regulator
              </dt>
              <dd className="mt-1 font-medium">{s.regulator}</dd>
            </div>
            <div className="py-4">
              <dt className="font-mono text-xs uppercase tracking-widest text-ink-soft">
                Main legislation
              </dt>
              <dd className="mt-1 font-medium">{s.act}</dd>
            </div>
            <div className="py-4">
              <dt className="font-mono text-xs uppercase tracking-widest text-ink-soft">
                Work across
              </dt>
              <dd className="mt-1 font-medium">{s.cities.join(", ")}</dd>
            </div>
          </dl>
          <p className="mt-6 max-w-md text-sm text-ink-soft">
            This is general information, not legal advice. Check current
            requirements with {s.regulator}.
          </p>
        </div>
        <div>
          <h2 className="font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-extrabold leading-[1.05] tracking-tight">
            What WHSCOMPLY handles
          </h2>
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {topics.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/solutions/${t.slug}`}
                  className="row-hover block py-3 font-medium"
                >
                  {t.nav}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
