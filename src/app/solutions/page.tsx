import type { Metadata } from "next";
import Link from "next/link";
import { topics } from "@/lib/content";
import { CtaBand, PageHeader } from "@/components/Sections";
import { SwmsMock, TicketsMock, IncidentMock } from "@/components/WhsMocks";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "WHSCOMPLY solutions for builders: SWMS, site inductions, white cards and licences, subcontractors, inspections and incidents.",
  alternates: { canonical: "/solutions" },
};

const rows = [
  [
    "SWMS and inductions",
    "Build from a task library, sign on at the gate, and see who has not signed before work starts.",
    <SwmsMock key="a" />,
  ],
  [
    "Tickets and subcontractors",
    "White cards, high risk work licences, insurances and WorkCover dates, with alerts before they lapse.",
    <TicketsMock key="b" />,
  ],
  [
    "Incidents and inspections",
    "Report from any phone, follow the same steps every time, and track corrective actions to done.",
    <IncidentMock key="c" />,
  ],
] as const;

export default function Solutions() {
  return (
    <>
      <PageHeader
        eyebrow="Solutions"
        title={
          <>
            Everything a site owes, <span className="tape">in one place</span>.
          </>
        }
      >
        The paperwork that sits behind the WHS Act, filled in as the work is
        done.
      </PageHeader>
      <section className="mx-auto mt-16 max-w-6xl space-y-24 px-5 sm:px-8">
        {rows.map(([t, d, v], i) => (
          <div key={t} className="grid items-center gap-12 lg:grid-cols-2">
            <div data-reveal className={i % 2 ? "lg:order-2" : ""}>
              <h2 className="font-display text-[clamp(1.9rem,3.6vw,3rem)] font-extrabold leading-[1.05] tracking-tight">
                {t}
              </h2>
              <p className="mt-5 max-w-md text-ink-soft">{d}</p>
            </div>
            <div data-reveal>{v}</div>
          </div>
        ))}
      </section>
      <section className="mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <p className="eyebrow">More solutions</p>
        <ul className="mt-5 divide-y divide-line border-y border-line">
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
      </section>
      <CtaBand />
    </>
  );
}
