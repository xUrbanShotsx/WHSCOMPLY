import { SiteBoardMock, SiteTrailMock } from "@/components/WhsMocks";
import { CtaBand, Eyebrow } from "@/components/Sections";
import { Icon } from "@/components/Icons";
import { FaqList } from "@/components/Faq";
import { homeFaqs } from "@/lib/content";
import { faqPage, JsonLd } from "@/lib/jsonld";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { Magnetic } from "@/components/Magnetic";

const cta =
  "inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold transition-colors duration-200";

/** Descriptors of the builders WHSCOMPLY was built with. Add named customers here once they have agreed to be listed. */
const clients = [
  "Residential builders",
  "Commercial fit-out",
  "Civil contractors",
  "Specialist subbies",
  "Site managers",
];

const pains: [string, string][] = [
  [
    "The SWMS on site is not the one the crew signed.",
    "One live version per task. Every signature is kept against the version and the day.",
  ],
  [
    "Nobody knows who is on site until the muster point.",
    "Workers sign on at the gate, so the list of people on site is always current.",
  ],
  [
    "A licence lapses because the reminder was in someone's phone.",
    "Alerts before every expiry, and a lapsed ticket is flagged at sign-on.",
  ],
  [
    "Subcontractor insurances are found out of date after the work starts.",
    "Policy and WorkCover dates are tracked, and the subbie is reminded directly.",
  ],
  [
    "Near misses are mentioned at smoko and never written down.",
    "Report from a phone in a minute, with photos, and follow the same close-out steps every time.",
  ],
  [
    "An audit means days of digging through folders and the ute.",
    "Every write is logged with the previous value, and the audit pack is an export.",
  ],
];

export default function WhsHome() {
  return (
    <>
      <JsonLd data={faqPage(homeFaqs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: SITE_NAME,
          url: SITE_URL,
          description: DEFAULT_DESCRIPTION,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web, iOS, Android",
          areaServed: { "@type": "Country", name: "Australia" },
        }}
      />
      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[0.9fr_1.1fr]">
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
                  href="/demo"
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
          <div data-load>
            <div data-parallax="6">
              <div className="float">
                <SiteBoardMock />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* scope strip */}
      <div className="relative overflow-hidden bg-[linear-gradient(110deg,oklch(0.19_0.02_255),oklch(0.32_0.04_255)_55%,oklch(0.2_0.02_255))] py-5 font-mono text-xs uppercase tracking-[0.18em] text-bg shadow-[inset_0_1px_0_oklch(1_0_0/0.18),inset_0_-1px_0_oklch(0_0_0/0.4)]">
        <div
          aria-hidden="true"
          className="glow-x pointer-events-none absolute h-24 w-72 rounded-full bg-accent/70 blur-3xl"
        />
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

      {/* who we build with + pain points */}
      <section className="mx-auto mt-28 max-w-6xl px-5 sm:px-8">
        <div
          data-reveal
          className="flex flex-col gap-4 border-y border-line py-6 lg:flex-row lg:items-center lg:gap-10"
        >
          <p className="shrink-0 font-mono text-xs uppercase tracking-widest text-ink-soft">
            Built with builders at
          </p>
          <ul className="flex flex-wrap gap-2">
            {clients.map((c) => (
              <li
                key={c}
                className="rounded-full bg-tint px-4 py-2 text-sm font-semibold"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div
          id="features"
          className="mt-20 grid scroll-mt-28 grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[0.8fr_1.2fr]"
        >
          <div data-reveal className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>Where it goes wrong</Eyebrow>
            <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.02] tracking-tight">
              Six places sites lose the paperwork.
            </h2>
            <p className="mt-5 max-w-sm text-ink-soft">
              These are the gaps builders tell us about. Each one has a fix that
              does not depend on someone remembering.
            </p>
          </div>
          <ol data-stagger className="border-t border-ink">
            {pains.map(([pain, fix], i) => (
              <li
                key={pain}
                className="row-hover grid gap-3 border-b border-line py-6 md:grid-cols-[2.5rem_1fr_1fr] md:gap-6"
              >
                <span className="font-mono text-sm text-ink-soft">
                  0{i + 1}
                </span>
                <p className="font-display text-xl font-extrabold leading-snug">
                  {pain}
                </p>
                <p className="text-ink-soft">
                  <span className="mb-1 block font-mono text-[0.7rem] uppercase tracking-widest text-ink">
                    With WHSCOMPLY
                  </span>
                  {fix}
                </p>
              </li>
            ))}
          </ol>
        </div>
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
            <SiteTrailMock />
          </div>
        </div>
      </section>

      {/* faq */}
      <section className="mx-auto mt-28 max-w-3xl px-5 sm:px-8">
        <div data-reveal>
          <Eyebrow>Questions</Eyebrow>
          <h2 className="mt-5 font-display text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1.02] tracking-tight">
            Common questions about WHS compliance software.
          </h2>
          <div className="mt-10">
            <FaqList faqs={homeFaqs} />
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
