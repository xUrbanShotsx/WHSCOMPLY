import type { Metadata } from "next";
import { CtaBand, PageHeader } from "@/components/Sections";

export const metadata: Metadata = { title: "About | WHSCOMPLY" };

export default function About() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title={
          <>
            Built for the people who run <span className="tape">sites</span>.
          </>
        }
      >
        WHSCOMPLY exists because safety paperwork should be a by-product of
        doing the work, not a second job done on Friday afternoon.
      </PageHeader>
      <section className="mx-auto mt-16 grid max-w-6xl gap-10 px-5 sm:px-8 md:grid-cols-3">
        {[
          [
            "Plain",
            "Software a foreman can use in gloves, on a phone, at the gate.",
          ],
          [
            "Checkable",
            "Every claim in the product can be exported and shown to an inspector.",
          ],
          [
            "Early",
            "We flag what is owed while there is still time to fix it.",
          ],
        ].map(([t, d]) => (
          <div key={t} data-reveal className="border-t border-ink pt-6">
            <h2 className="font-display text-3xl font-extrabold">{t}</h2>
            <p className="mt-3 max-w-xs text-ink-soft">{d}</p>
          </div>
        ))}
      </section>
      <CtaBand />
    </>
  );
}
