import {
  IncidentMock,
  SiteBoardMock,
  SiteTrailMock,
  SwmsMock,
  TicketsMock,
} from "@/components/WhsMocks";
import { Eyebrow } from "@/components/Sections";
import { Icon } from "@/components/Icons";
import { Magnetic } from "@/components/Magnetic";

const cta =
  "inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold transition-colors duration-200";

const rows = [
  {
    n: "01",
    id: "features",
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
    body: "Every worker and subcontractor carries their tickets with them into the system. Expiries are flagged weeks ahead, and a lapsed licence blocks sign-on instead of surfacing in an audit.",
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

export default function WhsHome() {
  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div data-load>
              <Eyebrow>WHS compliance software for builders</Eyebrow>
            </div>
            <h1
              data-load
              className="mt-6 font-display text-[clamp(2.7rem,6.4vw,5.5rem)] font-extrabold leading-[0.98] tracking-tight"
            >
              Every worker on site, <span className="tape">cleared</span> before
              they pick up a tool.
            </h1>
            <p data-load className="mt-7 max-w-lg text-lg text-ink-soft">
              WHSCOMPLY keeps your sites compliant with the WHS Act: SWMS,
              inductions, tickets, inspections and incidents in one place, with
              a flag on whatever is still owed.
            </p>
            <div data-load className="mt-9 flex flex-wrap items-center gap-4">
              <Magnetic>
                <a
                  href="#book"
                  className={`${cta} bg-ink text-bg hover:bg-ink/85`}
                >
                  Book a demo <Icon name="arrow" className="h-4 w-4" />
                </a>
              </Magnetic>
              <a
                href="#how"
                className={`${cta} border border-ink/30 hover:border-ink hover:bg-tint`}
              >
                See how a site gets cleared
              </a>
            </div>
          </div>
          <div data-load className="xl:-mr-16">
            <div data-parallax="6">
              <div className="float">
                <SiteBoardMock />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* scope strip */}
      <div className="overflow-hidden border-y border-line bg-tint py-4 font-mono text-xs uppercase tracking-[0.18em]">
        <ul
          className="marquee flex w-max gap-10 whitespace-nowrap"
          aria-label="What WHSCOMPLY covers"
        >
          {[0, 1, 2, 3].flatMap((k) =>
            [
              "SWMS",
              "Site inductions",
              "Tickets and licences",
              "Subcontractors",
              "Inspections",
              "Incidents",
              "Audit pack",
            ].map((t) => (
              <li
                key={`${k}-${t}`}
                className="flex items-center gap-10"
                aria-hidden={k > 0}
              >
                {t}
                <span className="text-accent">/</span>
              </li>
            )),
          )}
        </ul>
      </div>

      {/* problem */}
      <section className="mx-auto mt-28 grid max-w-6xl gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1fr]">
        <div data-reveal>
          <Eyebrow>The problem</Eyebrow>
          <h2 className="mt-5 font-display text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1.02] tracking-tight">
            Site safety lives in the ute, the shed and someone&rsquo;s phone.
          </h2>
          <p className="mt-6 max-w-md text-ink-soft">
            Paperwork is only found missing after something goes wrong or an
            inspector turns up. By then you are reconstructing it from memory.
          </p>
          <p className="mt-6 max-w-md font-mono text-xs uppercase leading-relaxed tracking-wider text-ink-soft">
            As a PCBU you must be able to show what you did, not just say it.
          </p>
        </div>
        <div data-reveal className="relative min-h-72 sm:min-h-80">
          {[
            [
              "Sign-in sheet, clipboard",
              "water damage, page 2 missing",
              "left-0 top-2 -rotate-3",
            ],
            [
              "SWMS_final_v7_USE THIS.docx",
              "which one did the crew sign?",
              "right-0 top-24 rotate-2",
            ],
            [
              "Ute glovebox",
              "three white cards, no idea whose",
              "left-6 bottom-0 -rotate-1",
            ],
          ].map(([t, s, pos]) => (
            <div
              key={t}
              className={`absolute w-64 max-w-[80%] border border-line bg-surface p-4 shadow-md ${pos}`}
            >
              <p className="font-mono text-xs uppercase tracking-wider">{t}</p>
              <p className="mt-1 text-sm text-ink-soft">{s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* feature rows */}
      <section className="mx-auto mt-28 max-w-6xl space-y-28 px-5 sm:px-8">
        {rows.map((r, i) => (
          <div
            key={r.n}
            id={r.id}
            className="grid scroll-mt-28 items-center gap-12 lg:grid-cols-2"
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
      </section>

      {/* how it works */}
      <section
        id="how"
        className="mx-auto mt-28 max-w-6xl scroll-mt-24 px-5 sm:px-8"
      >
        <div data-reveal>
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-5 max-w-2xl font-display text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1.02] tracking-tight">
            From first site to audit pack in three steps.
          </h2>
        </div>
        <ol
          data-stagger
          className="mt-12 grid gap-10 border-t border-ink pt-8 md:grid-cols-3"
        >
          {[
            [
              "Set up",
              "Add your sites, crew and subcontractors, and bring your existing SWMS and tickets across.",
            ],
            [
              "Sign on",
              "Workers sign on and sign SWMS from their phone or a gate tablet. Anything owed is flagged to the foreman.",
            ],
            [
              "Prove",
              "Export the pack for any site and date range, or give an inspector read-only access.",
            ],
          ].map(([t, d], i) => (
            <li key={t}>
              <span className="font-mono text-sm text-ink-soft">
                Step {i + 1}
              </span>
              <h3 className="mt-2 font-display text-3xl font-extrabold">{t}</h3>
              <p className="mt-3 max-w-xs text-ink-soft">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* audit */}
      <section id="audit" className="mt-28 scroll-mt-16 bg-ink py-24 text-bg">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
          <div data-reveal>
            <Eyebrow>Audit ready</Eyebrow>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1.02] tracking-tight">
              The inspector asks. The pack is already built.
            </h2>
            <p className="mt-6 max-w-md text-bg/75">
              Every sign-on, signature and report is time-stamped and kept with
              who did it. Records are never hard-deleted, so the proof is an
              export, not a week of digging through folders.
            </p>
          </div>
          <div data-reveal>
            <SiteTrailMock dark />
          </div>
        </div>
      </section>

      {/* cta */}
      <section
        id="book"
        className="mx-auto mt-28 max-w-6xl scroll-mt-24 px-5 sm:px-8"
      >
        <div
          data-reveal
          className="relative overflow-hidden rounded-[2rem] bg-accent px-7 py-16 text-ink sm:px-14 sm:py-20"
        >
          <h2 className="max-w-3xl font-display text-[clamp(2.2rem,5vw,4.2rem)] font-extrabold leading-[1] tracking-tight">
            Find the gaps before an inspector does.
          </h2>
          <p className="mt-5 max-w-lg text-lg">
            Thirty minutes, your SWMS and your site setup. Bring one messy
            project and we will clear it live.
          </p>
          <div className="mt-9">
            <Magnetic>
              <a
                href="mailto:hello@whscomply.com"
                className={`${cta} bg-ink text-bg hover:bg-ink/85`}
              >
                Book a demo <Icon name="arrow" className="h-4 w-4" />
              </a>
            </Magnetic>
          </div>
          <p className="mt-10 font-mono text-xs uppercase tracking-widest">
            Powered by Briesa
          </p>
        </div>
      </section>
    </>
  );
}
