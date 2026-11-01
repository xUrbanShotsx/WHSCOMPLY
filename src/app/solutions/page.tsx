import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icons";
import { CtaBand, Eyebrow, PageHeader } from "@/components/Sections";
import { IncidentMock, SwmsMock, TicketsMock } from "@/components/WhsMocks";
import { topics } from "@/lib/content";
import { breadcrumbs, JsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Solutions for Builders and Subcontractors",
  description:
    "WHSCOMPLY solutions for builders: SWMS, site inductions, white cards and licences, subcontractors, inspections and incidents, sized for a subbie, a builder or a group.",
  alternates: { canonical: "/solutions" },
};

const audiences = [
  {
    title: "Subcontractor",
    line: "For the business owner who is also the safety officer: a small crew, a few sites and nobody spare to chase paperwork.",
    points: [
      "A SWMS library your crew signs on their phones",
      "Tickets and licences tracked, with alerts before expiry",
      "Insurances ready to hand to every builder who asks",
      "Incident reports from the site, in a minute",
    ],
  },
  {
    title: "Builder",
    line: "For a builder running several live projects, and answerable as principal contractor for everyone on them.",
    points: [
      "Site inductions and sign-on at every gate",
      "Subcontractor prequalification before they start",
      "Inspections and corrective actions tracked to done",
      "One-click audit pack export per site",
    ],
  },
  {
    title: "Group",
    line: "For a multi-site builder with a safety team that answers for every project at once.",
    points: [
      "Every site on one board",
      "Roles and approvals across projects",
      "Reporting by site, trade and period",
      "Read-only access for inspectors and clients",
    ],
  },
];

const modules = [
  [
    "Sites",
    "One record per project, with its SWMS, inductions, tickets, inspections and incidents on it.",
  ],
  [
    "People",
    "Workers and subcontractors with their cards, licences and insurances, and the dates that matter.",
  ],
  [
    "Safety",
    "SWMS, toolbox talks, inspection checklists and incident reports, filled in as the work happens.",
  ],
  [
    "Audit",
    "A time-stamped log under all of it, and a pack you can export for any site and period.",
  ],
];

const levels = [
  [
    "Owner",
    "One per business. The only level that can close it, transfer ownership or change billing.",
  ],
  [
    "Admin",
    "Sees every site and runs the business day to day, subcontractors included.",
  ],
  [
    "Site manager",
    "Runs their own sites: inductions, SWMS, inspections and incident close-out.",
  ],
  [
    "Worker",
    "Signs on, signs SWMS and reports hazards from a phone, and sees only their own records.",
  ],
  [
    "Inspector",
    "An external, read-only, time-boxed grant. Sees everything and changes nothing.",
  ],
];

const rows = [
  {
    n: "01",
    eyebrow: "SWMS and inductions",
    title: "Safe work method statements that every worker actually signs.",
    body: "Build a SWMS from your own task library, push it to the crew's phones and sign on at the gate. If someone has not signed, the foreman sees the name before the work starts.",
    points: [
      "Reusable SWMS templates for high risk construction work",
      "Site inductions that sign workers on once per project",
      "Version history, so you can show which SWMS was live on which day",
    ],
    visual: <SwmsMock />,
  },
  {
    n: "02",
    eyebrow: "People and subcontractors",
    title: "White cards, licences and insurances that warn you early.",
    body: "Every worker and subcontractor carries their tickets into the system. Expiries are flagged weeks ahead, and a lapsed licence is flagged at sign-on instead of surfacing in an audit.",
    points: [
      "General induction cards and high risk work licences on file",
      "Subcontractor prequalification, insurance and WorkCover dates",
      "Alerts to the site manager and the subbie before expiry",
    ],
    visual: <TicketsMock />,
  },
  {
    n: "03",
    eyebrow: "Incidents and inspections",
    title: "Incident reports closed out properly, not left in the ute.",
    body: "Report a near miss from site with photos in under a minute. Each report walks through the same steps, including whether it needs notifying to the regulator, and stays open until it is closed out.",
    points: [
      "Incident, near miss and hazard reports from any phone",
      "Plant, scaffold and daily site inspection checklists",
      "Corrective actions assigned, dated and tracked to done",
    ],
    visual: <IncidentMock />,
  },
];

export default function Solutions() {
  return (
    <>
      <JsonLd
        data={breadcrumbs(SITE_URL, [
          { name: "Home", path: "/" },
          { name: "Solutions", path: "/solutions" },
        ])}
      />
      <PageHeader
        eyebrow="Solutions"
        title={
          <>
            Built for the builder who answers for{" "}
            <span className="tape">everyone</span> on site.
          </>
        }
      >
        The same system for every business. What changes is how many sites you
        run and how many people sign in.
      </PageHeader>

      <section className="mx-auto mt-16 max-w-6xl border-t border-ink px-5 sm:px-8">
        {audiences.map((a, i) => (
          <div
            key={a.title}
            data-reveal
            className="grid gap-6 border-b border-line py-12 md:grid-cols-[4rem_1.1fr_1fr]"
          >
            <span className="font-mono text-sm text-ink-soft">0{i + 1}</span>
            <div>
              <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.02] tracking-tight">
                {a.title}
              </h2>
              <p className="mt-3 max-w-sm text-ink-soft">{a.line}</p>
            </div>
            <ul className="space-y-3 self-center">
              {a.points.map((p) => (
                <li key={p} className="flex items-start gap-3 font-medium">
                  <Icon name="check" className="mt-1 h-4 w-4 shrink-0" /> {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="mt-24 bg-tint py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div data-reveal>
            <Eyebrow>Four modules, one record</Eyebrow>
            <h2 className="mt-5 max-w-xl font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.02] tracking-tight">
              Every module reads and writes the same site record.
            </h2>
          </div>
          <dl className="mt-12 grid gap-x-16 gap-y-10 md:grid-cols-2">
            {modules.map(([t, d]) => (
              <div key={t} data-reveal className="border-t border-ink pt-4">
                <dt className="font-display text-2xl font-extrabold">{t}</dt>
                <dd className="mt-2 text-ink-soft">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* product tour */}
      <section className="mx-auto mt-28 max-w-6xl px-5 sm:px-8">
        <div data-reveal className="mb-16">
          <Eyebrow>Product tour</Eyebrow>
          <h2 className="mt-5 max-w-2xl font-display text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1.02] tracking-tight">
            See how WHSCOMPLY handles the SWMS, the tickets and the incident.
          </h2>
        </div>
        <div className="space-y-28">
          {rows.map((r, i) => (
            <div
              key={r.n}
              className="grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-2"
            >
              <div data-reveal className={i % 2 ? "lg:order-2" : ""}>
                <p className="font-mono text-sm text-ink-soft">{r.n}</p>
                <div className="mt-3">
                  <Eyebrow>{r.eyebrow}</Eyebrow>
                </div>
                <h2 className="mt-5 font-display text-[clamp(1.9rem,3.6vw,3rem)] font-extrabold leading-[1.05] tracking-tight">
                  {r.title}
                </h2>
                <p className="mt-5 max-w-md text-ink-soft">{r.body}</p>
                <ul
                  data-stagger
                  className="mt-6 divide-y divide-line border-y border-line"
                >
                  {r.points.map((p) => (
                    <li key={p} className="row-hover py-3 text-sm font-medium">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div data-reveal>{r.visual}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div data-reveal className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>Who is involved</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight">
            Five access levels. Tickets decide who works.
          </h2>
          <p className="mt-4 max-w-sm text-ink-soft">
            Roles filter what someone sees. A lapsed ticket or an unsigned SWMS
            is flagged before the work starts.
          </p>
        </div>
        <ol data-stagger className="border-t border-ink">
          {levels.map(([t, d]) => (
            <li
              key={t}
              className="row-hover grid gap-1 border-b border-line py-5 sm:grid-cols-[9rem_1fr]"
            >
              <h3 className="font-display text-xl font-extrabold">{t}</h3>
              <p className="text-ink-soft">{d}</p>
            </li>
          ))}
        </ol>
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
