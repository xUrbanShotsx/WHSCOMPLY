import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList } from "@/components/Faq";
import { CtaBand, PageHeader } from "@/components/Sections";
import { breadcrumbs, faqPage, JsonLd } from "@/lib/jsonld";
import { topicBySlug, topics } from "@/lib/content";
import { LAST_UPDATED, SITE_NAME, SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return topics.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/solutions/[slug]">): Promise<Metadata> {
  const t = topicBySlug((await params).slug);
  if (!t) return {};
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: `/solutions/${t.slug}` },
    openGraph: {
      title: t.title,
      description: t.description,
      url: `/solutions/${t.slug}`,
      type: "article",
    },
  };
}

export default async function Topic({
  params,
}: PageProps<"/solutions/[slug]">) {
  const t = topicBySlug((await params).slug);
  if (!t) notFound();
  const related = t.related
    .map((s) => topicBySlug(s))
    .filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <>
      <JsonLd
        data={breadcrumbs(SITE_URL, [
          { name: "Home", path: "/" },
          { name: "Solutions", path: "/solutions" },
          { name: t.nav, path: `/solutions/${t.slug}` },
        ])}
      />
      <JsonLd data={faqPage(t.faqs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: t.title,
          description: t.description,
          url: `${SITE_URL}/solutions/${t.slug}`,
          dateModified: LAST_UPDATED,
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
          about: t.nav,
        }}
      />
      <PageHeader eyebrow="Solutions" title={t.h1}>
        {t.intro}
      </PageHeader>

      <section className="mx-auto mt-16 max-w-6xl px-5 sm:px-8">
        <ul
          data-stagger
          className="grid gap-10 border-t border-ink pt-8 md:grid-cols-3"
        >
          {t.points.map(([h, d]) => (
            <li key={h}>
              <h2 className="font-display text-2xl font-extrabold">{h}</h2>
              <p className="mt-3 text-ink-soft">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-24 max-w-3xl px-5 sm:px-8">
        <h2 className="font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-extrabold leading-[1.05] tracking-tight">
          Questions about {t.nav.toLowerCase()}
        </h2>
        <div className="mt-8">
          <FaqList faqs={t.faqs} />
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <p className="eyebrow">Related</p>
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {related.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/solutions/${r.slug}`}
                className="row-hover block py-3 font-medium"
              >
                {r.nav}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <CtaBand />
    </>
  );
}
