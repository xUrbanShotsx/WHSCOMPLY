import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, PageHeader } from "@/components/Sections";
import { states } from "@/lib/content";

export const metadata: Metadata = {
  title: "WHS Compliance Software by State",
  description:
    "WHSCOMPLY for builders in NSW, Victoria, Queensland, WA, SA, Tasmania, the ACT and the Northern Territory.",
  alternates: { canonical: "/states" },
};

export default function States() {
  return (
    <>
      <PageHeader
        eyebrow="Australia"
        title={
          <>
            Built for builders in <span className="tape">every state</span>.
          </>
        }
      >
        Each state and territory has its own regulator. Pick yours to see what
        applies and how WHSCOMPLY fits.
      </PageHeader>
      <section className="mx-auto mt-16 max-w-6xl px-5 sm:px-8">
        <ul className="grid gap-px border border-line bg-line sm:grid-cols-2">
          {states.map((s) => (
            <li key={s.slug} className="bg-surface">
              <Link href={`/states/${s.slug}`} className="row-hover block p-6">
                <span className="font-mono text-xs uppercase tracking-widest text-ink-soft">
                  {s.code}
                </span>
                <span className="mt-1 block font-display text-2xl font-extrabold">
                  {s.name}
                </span>
                <span className="mt-1 block text-sm text-ink-soft">
                  {s.regulator}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <CtaBand />
    </>
  );
}
