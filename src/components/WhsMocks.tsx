import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icons";

/* ---------- stage + browser window (the screenshot treatment) ---------- */

const NAV: { icon: IconName; id: string }[] = [
  { icon: "home", id: "sites" },
  { icon: "file", id: "swms" },
  { icon: "id", id: "people" },
  { icon: "shield", id: "incidents" },
  { icon: "clock", id: "audit" },
];

function AppWindow({
  url,
  tab,
  active,
  children,
}: {
  url: string;
  tab: string;
  active: string;
  children: ReactNode;
}) {
  return (
    <div className="lift relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(140deg,oklch(0.19_0.02_255),oklch(0.32_0.04_255))] pl-4 pt-5 shadow-[0_40px_90px_-40px_oklch(0.23_0.02_255/0.7)] sm:pl-8 sm:pt-8">
      {/* light spilling in from the left edge */}
      <div
        aria-hidden="true"
        className="glow pointer-events-none absolute h-56 w-56 rounded-full bg-accent/80 blur-3xl"
      />
      <div className="relative -mr-4 overflow-hidden rounded-tl-2xl bg-surface text-ink ring-1 ring-white/20">
        {/* browser chrome */}
        <div className="bg-[oklch(0.94_0.01_85)] px-3 pt-2.5">
          <div className="flex items-end gap-3">
            <span className="mb-2 flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.7_0.18_25)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.82_0.15_85)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0.16_150)]" />
            </span>
            <span className="flex min-w-0 items-center gap-2 rounded-t-lg bg-surface px-3 py-1.5 text-[11px] font-medium">
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] bg-accent text-[8px] font-bold text-ink">
                W
              </span>
              <span className="truncate">{tab}</span>
              <Icon name="close" className="h-3 w-3 shrink-0 text-ink-soft" />
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 border-b border-line bg-surface px-3 py-2 text-ink-soft">
          <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" />
          <Icon name="arrow" className="h-3.5 w-3.5" />
          <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-bg px-3 py-1 text-[11px]">
            <Icon name="lock" className="h-3 w-3 shrink-0" />
            <span className="truncate">{url}</span>
          </span>
        </div>

        {/* app header */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt=""
            width={427}
            height={63}
            className="h-3.5 w-auto"
          />
          <span className="ml-auto hidden items-center gap-1.5 rounded-full bg-bg px-3 py-1 text-[11px] text-ink-soft sm:flex">
            <Icon name="search" className="h-3 w-3" /> Search
          </span>
          <span className="rounded-full bg-tint px-2.5 py-1 text-[10px] font-semibold text-ink-soft">
            Sample data
          </span>
        </div>

        <div className="flex">
          <nav
            aria-hidden="true"
            className="hidden w-12 shrink-0 flex-col items-center gap-1 border-r border-line bg-bg py-3 sm:flex"
          >
            {NAV.map((n) => (
              <span
                key={n.id}
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  n.id === active ? "bg-accent/25 text-ink" : "text-ink-soft"
                }`}
              >
                <Icon name={n.icon} className="h-4 w-4" />
              </span>
            ))}
          </nav>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

function PageTitle({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5">
      <div className="min-w-0">
        <h3 className="font-display text-lg font-extrabold leading-tight tracking-tight">
          {title}
        </h3>
        {sub && <p className="mt-0.5 text-[13px] text-ink-soft">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

/* ---------- small parts ---------- */

type Tone = "ok" | "owed" | "neutral" | "solid";

function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  const styles: Record<Tone, string> = {
    ok: "bg-ink/[0.06] text-ink",
    owed: "bg-accent/20 text-ink",
    neutral: "bg-tint text-ink-soft",
    solid: "bg-ink text-bg",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[tone]}`}
    >
      {tone === "ok" && <Icon name="check" className="h-3 w-3" />}
      {tone === "owed" && (
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      )}
      {children}
    </span>
  );
}

function Avatar({
  initials,
  tone = 0,
}: {
  initials: string;
  tone?: 0 | 1 | 2;
}) {
  const t = [
    "bg-accent/20 text-ink",
    "bg-ink/10 text-ink",
    "bg-tint text-ink-soft",
  ][tone];
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${t}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

function Progress({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-tint">
      <div
        className="h-full rounded-full bg-accent"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ---------- hero: the site board ---------- */

export function SiteBoardMock() {
  const rows: {
    name: string;
    note: string;
    status: string;
    tone: Tone;
    who: string;
  }[] = [
    {
      name: "SWMS, formwork and concrete pour",
      note: "Signed by 9 of 9 · 6:52am",
      status: "Signed",
      tone: "ok",
      who: "RD",
    },
    {
      name: "Site induction, 14 Marsh Ave",
      note: "Completed by T. Nguyen · today",
      status: "Complete",
      tone: "ok",
      who: "TN",
    },
    {
      name: "Crane inspection, Level 3",
      note: "Checked by Sam · 7:05am",
      status: "Complete",
      tone: "ok",
      who: "SK",
    },
    {
      name: "SWMS, scaffold alteration",
      note: "3 workers unsigned · due before start",
      status: "Unsigned",
      tone: "owed",
      who: "RD",
    },
    {
      name: "EWP licence, M. Okafor",
      note: "High risk work licence · expires 19 Nov",
      status: "Expires in 18 days",
      tone: "neutral",
      who: "MO",
    },
  ];
  const sites: [string, string][] = [
    ["14 Marsh Ave, Level 3", "Live"],
    ["8 Quarry Rd, Stage 2", "Live"],
    ["Harbour St fit-out", "Starts Mon"],
    ["22 Pine Ct, Townhouses", "Handover"],
  ];
  return (
    <AppWindow
      url="app.whscomply.com/sites/14-marsh-ave"
      tab="14 Marsh Ave · WHSCOMPLY"
      active="sites"
    >
      <div className="flex">
        {/* site list */}
        <aside className="hidden w-44 shrink-0 border-r border-line bg-bg p-3 xl:block">
          <p className="px-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
            Every site
          </p>
          <ul className="space-y-1">
            {sites.map(([a, s], i) => (
              <li
                key={a}
                className={`rounded-lg px-2 py-2 ${i === 0 ? "bg-surface shadow-sm ring-1 ring-line" : ""}`}
              >
                <p className="truncate text-xs font-semibold">{a}</p>
                <p className="text-[11px] text-ink-soft">{s}</p>
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-w-0 flex-1">
          <PageTitle
            title="14 Marsh Avenue, Level 3"
            sub="Concrete structure · 41 workers on site"
            right={<Pill tone="neutral">3 of 5 clear</Pill>}
          />
          <div className="px-5 pt-4">
            <Progress pct={60} />
            <div className="mt-4 flex gap-5 overflow-hidden whitespace-nowrap border-b border-line text-[13px] font-medium text-ink-soft">
              {[
                "Overview",
                "SWMS",
                "Inductions",
                "Tickets",
                "Incidents",
                "Activity",
              ].map((t) => (
                <span
                  key={t}
                  className={`-mb-px border-b-2 pb-2.5 ${t === "Overview" ? "border-accent text-ink" : "border-transparent"}`}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <ul>
            {rows.map((r, i) => (
              <li
                key={r.name}
                style={{ animationDelay: `${0.5 + i * 0.28}s` }}
                className={`board-row flex items-center gap-3 border-b border-line px-5 py-3 last:border-0 ${
                  r.tone === "owed"
                    ? "bg-accent/[0.1] shadow-[inset_3px_0_0_var(--accent)]"
                    : ""
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    r.tone === "ok"
                      ? "bg-ink text-bg"
                      : "border-[1.5px] border-dashed border-ink-soft/60"
                  }`}
                  aria-hidden="true"
                >
                  {r.tone === "ok" && <Icon name="check" className="h-3 w-3" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.name}</p>
                  <p className="truncate text-xs text-ink-soft">{r.note}</p>
                </div>
                <span className="hidden sm:block">
                  <Pill tone={r.tone}>{r.status}</Pill>
                </span>
                <Avatar initials={r.who} tone={(i % 3) as 0 | 1 | 2} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppWindow>
  );
}

/* ---------- SWMS sign-on ---------- */

export function SwmsMock() {
  const steps: [string, string][] = [
    ["Erect formwork at height", "Fall from height"],
    ["Pump and place concrete", "Hose whip, manual handling"],
    ["Strip and stack formwork", "Struck by falling objects"],
  ];
  const signers: { n: string; i: string; t: string; done: boolean }[] = [
    { n: "R. Dunn, foreman", i: "RD", t: "6:48am", done: true },
    { n: "T. Nguyen", i: "TN", t: "6:50am", done: true },
    { n: "M. Okafor", i: "MO", t: "6:52am", done: true },
    { n: "L. Petrov", i: "LP", t: "Waiting", done: false },
  ];
  return (
    <AppWindow
      url="app.whscomply.com/swms/formwork-concrete-pour"
      tab="SWMS · WHSCOMPLY"
      active="swms"
    >
      <PageTitle
        title="Formwork and concrete pour"
        sub="SWMS v4 · 14 Marsh Ave"
        right={<Pill tone="owed">3 of 4 signed</Pill>}
      />
      <div className="px-5 pb-4 pt-3">
        <Progress pct={75} />
      </div>
      <section className="border-t border-line">
        <div className="flex items-center justify-between bg-bg px-5 py-2 text-xs font-bold uppercase tracking-wider text-ink-soft">
          High risk steps
          <span className="font-medium normal-case tracking-normal">
            {steps.length}
          </span>
        </div>
        <ul>
          {steps.map(([task, hazard]) => (
            <li
              key={task}
              className="flex items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm first:border-t-0"
            >
              <span className="min-w-0 flex-1 truncate font-semibold">
                {task}
              </span>
              <span className="hidden items-center gap-1 rounded-md bg-tint px-2 py-1 text-[11px] font-medium text-ink-soft md:inline-flex">
                <Icon name="shield" className="h-3 w-3" />
                {hazard}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="border-t border-line">
        <div className="flex items-center justify-between bg-bg px-5 py-2 text-xs font-bold uppercase tracking-wider text-ink-soft">
          Signed at the gate
          <span className="font-medium normal-case tracking-normal">3/4</span>
        </div>
        <ul>
          {signers.map((s, i) => (
            <li
              key={s.n}
              className={`flex items-center gap-3 border-t border-line px-5 py-3 first:border-t-0 ${
                s.done
                  ? ""
                  : "bg-accent/[0.1] shadow-[inset_3px_0_0_var(--accent)]"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] ${
                  s.done ? "border-ink bg-ink text-bg" : "border-ink-soft/50"
                }`}
                aria-hidden="true"
              >
                {s.done && <Icon name="check" className="h-3 w-3" />}
              </span>
              <span
                className={`min-w-0 flex-1 truncate text-sm ${s.done ? "text-ink-soft" : "font-semibold"}`}
              >
                {s.n}
              </span>
              <span className="font-mono text-xs text-ink-soft">{s.t}</span>
              <Avatar initials={s.i} tone={s.done ? 2 : ((i % 2) as 0 | 1)} />
            </li>
          ))}
        </ul>
      </section>
      <div className="flex items-center gap-2 bg-bg px-5 py-3 text-xs text-ink-soft">
        <Icon name="lock" className="h-3.5 w-3.5" /> Work cannot start until all
        four have signed
      </div>
    </AppWindow>
  );
}

/* ---------- people: tickets and licences ---------- */

export function TicketsMock() {
  const people = [
    {
      n: "R. Dunn",
      i: "RD",
      role: "General construction induction · foreman",
      exp: "No expiry",
      pct: 100,
      status: "Valid",
      tone: "ok" as Tone,
    },
    {
      n: "M. Okafor",
      i: "MO",
      role: "High risk work licence · EWP",
      exp: "19 Nov",
      pct: 12,
      status: "Expires in 18 days",
      tone: "owed" as Tone,
    },
    {
      n: "T. Nguyen",
      i: "TN",
      role: "High risk work licence · dogging",
      exp: "Mar 2027",
      pct: 75,
      status: "Valid",
      tone: "ok" as Tone,
    },
    {
      n: "Apex Scaffolding",
      i: "AS",
      role: "Public liability insurance",
      exp: "Jan 2027",
      pct: 30,
      status: "Renewal due",
      tone: "neutral" as Tone,
    },
  ];
  return (
    <AppWindow
      url="app.whscomply.com/people/tickets"
      tab="Tickets · WHSCOMPLY"
      active="people"
    >
      <PageTitle
        title="Tickets and licences"
        sub="Marsh Ave crew and subcontractors"
      />
      <div className="mx-4 mb-3 mt-4 flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/[0.1] p-3.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-ink">
          <Icon name="bell" className="h-4 w-4" />
        </span>
        <p className="text-[13px] leading-snug">
          <span className="font-bold">
            M. Okafor&apos;s EWP licence expires in 18 days.
          </span>{" "}
          <span className="text-ink-soft">
            Alerts go to the worker and the site manager before it lapses.
          </span>
        </p>
      </div>
      <ul>
        {people.map((p, i) => (
          <li
            key={p.n}
            className="flex items-center gap-3 border-t border-line px-5 py-3.5"
          >
            <Avatar initials={p.i} tone={(i % 3) as 0 | 1 | 2} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{p.n}</p>
              <p className="truncate text-xs text-ink-soft">
                {p.role} · exp. {p.exp}
              </p>
              <div className="mt-2 w-full max-w-[11rem]">
                <Progress pct={p.pct} />
              </div>
            </div>
            <span className="hidden sm:block">
              <Pill tone={p.tone}>{p.status}</Pill>
            </span>
          </li>
        ))}
      </ul>
    </AppWindow>
  );
}

/* ---------- incidents ---------- */

export function IncidentMock() {
  const groups: {
    title: string;
    done: number;
    items: {
      t: string;
      file?: string;
      who: string;
      done: boolean;
      due?: string;
    }[];
  }[] = [
    {
      title: "Respond",
      done: 4,
      items: [
        {
          t: "Reported from site with photos",
          file: "Photos (3)",
          who: "RD",
          done: true,
        },
        { t: "Area made safe and recorded", who: "SK", done: true },
        {
          t: "Injured worker and witnesses noted",
          file: "Statements.pdf",
          who: "SK",
          done: true,
        },
        { t: "Regulator notification assessed", who: "DW", done: true },
      ],
    },
    {
      title: "Close out",
      done: 0,
      items: [
        {
          t: "Investigation and root cause",
          who: "SK",
          done: false,
          due: "Due Fri",
        },
        {
          t: "Corrective actions assigned and done",
          who: "DW",
          done: false,
          due: "Due 14 Nov",
        },
      ],
    },
  ];
  return (
    <AppWindow
      url="app.whscomply.com/incidents/near-miss-level-3"
      tab="Incident · WHSCOMPLY"
      active="incidents"
    >
      <PageTitle
        title="Near miss, Level 3"
        sub="Reported today 10:20am · 14 Marsh Ave"
        right={
          <span className="text-[13px] font-semibold tabular-nums">
            4 of 6 done
          </span>
        }
      />
      <div className="px-5 pb-4 pt-3">
        <Progress pct={66} />
      </div>
      {groups.map((g) => (
        <section key={g.title} className="border-t border-line">
          <div className="flex items-center justify-between bg-bg px-5 py-2 text-xs font-bold uppercase tracking-wider text-ink-soft">
            {g.title}
            <span className="font-medium normal-case tracking-normal">
              {g.done}/{g.items.length}
            </span>
          </div>
          <ul>
            {g.items.map((it) => (
              <li
                key={it.t}
                className="flex items-center gap-3 border-t border-line px-5 py-3 first:border-t-0"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] ${
                    it.done ? "border-ink bg-ink text-bg" : "border-ink-soft/50"
                  }`}
                  aria-hidden="true"
                >
                  {it.done && <Icon name="check" className="h-3 w-3" />}
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-sm ${it.done ? "text-ink-soft" : "font-semibold"}`}
                >
                  {it.t}
                </span>
                {it.file && (
                  <span className="hidden items-center gap-1 rounded-md bg-tint px-2 py-1 text-[11px] font-medium text-ink-soft md:inline-flex">
                    <Icon name="clip" className="h-3 w-3" />
                    {it.file}
                  </span>
                )}
                {it.due && <Pill tone="owed">{it.due}</Pill>}
                <Avatar initials={it.who} tone={it.done ? 2 : 0} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </AppWindow>
  );
}

/* ---------- audit log ---------- */

export function SiteTrailMock() {
  const events = [
    {
      t: "10:31",
      who: "SK",
      name: "Sam Kowalski",
      act: "assigned a corrective action on the near miss",
      from: "Open",
      to: "Assigned",
    },
    {
      t: "10:20",
      who: "RD",
      name: "R. Dunn",
      act: "reported a near miss on Level 3, photos attached",
      from: "No report",
      to: "Reported",
    },
    {
      t: "07:05",
      who: "RD",
      name: "R. Dunn",
      act: "signed the scaffold alteration SWMS",
      from: "Unsigned",
      to: "Signed",
    },
    {
      t: "06:48",
      who: "LP",
      name: "L. Petrov",
      act: "signed on at the gate",
      from: "Off site",
      to: "On site",
    },
  ];
  return (
    <AppWindow
      url="app.whscomply.com/audit-log"
      tab="Audit log · WHSCOMPLY"
      active="audit"
    >
      <PageTitle
        title="Audit log"
        sub="Every write, who made it and what it was before"
        right={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-bg">
            <Icon name="download" className="h-3.5 w-3.5" /> Export pack
          </span>
        }
      />
      <div className="mt-4 flex gap-1.5 border-b border-line px-5 pb-3 text-xs font-semibold">
        {["All", "SWMS", "Incidents"].map((f, i) => (
          <span
            key={f}
            className={`rounded-full px-3 py-1 ${i === 0 ? "bg-ink text-bg" : "text-ink-soft"}`}
          >
            {f}
          </span>
        ))}
      </div>
      <ol>
        {events.map((e) => (
          <li
            key={e.t + e.act}
            className="flex gap-3 border-b border-line px-5 py-3.5 last:border-0"
          >
            <Avatar initials={e.who} tone={1} />
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug">
                <span className="font-semibold">{e.name}</span>{" "}
                <span className="text-ink-soft">{e.act}</span>
              </p>
              <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
                <span className="rounded-md bg-tint px-1.5 py-0.5 text-ink-soft line-through">
                  {e.from}
                </span>
                <Icon name="arrow" className="h-3 w-3 opacity-50" />
                <span className="rounded-md bg-accent/20 px-1.5 py-0.5">
                  {e.to}
                </span>
              </p>
            </div>
            <span className="shrink-0 pt-0.5 font-mono text-xs text-ink-soft">
              {e.t}
            </span>
          </li>
        ))}
      </ol>
      <div className="flex items-center gap-2 bg-bg px-5 py-3 text-xs text-ink-soft">
        <Icon name="lock" className="h-3.5 w-3.5" /> Entries cannot be edited or
        deleted
      </div>
    </AppWindow>
  );
}
