import { Icon } from "./Icons";

function Frame({
  title,
  children,
  dark = false,
}: {
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={`lift overflow-hidden rounded-2xl border shadow-[0_24px_60px_-28px_oklch(0.23_0.02_255/0.45)] ${
        dark
          ? "border-bg/15 bg-[oklch(0.3_0.02_255)] text-bg"
          : "border-line bg-surface"
      }`}
    >
      <div
        className={`flex items-center justify-between border-b px-5 py-3 ${dark ? "border-bg/15" : "border-line"}`}
      >
        <span className="font-mono text-xs uppercase tracking-widest">
          {title}
        </span>
        <span
          className={`font-mono text-[0.65rem] uppercase tracking-widest ${dark ? "text-bg/55" : "text-ink-soft"}`}
        >
          Sample data
        </span>
      </div>
      {children}
    </div>
  );
}

export function SiteBoardMock() {
  const rows: [string, string, "ok" | "flag" | "soon"][] = [
    ["SWMS, formwork and concrete pour", "Signed by 9 of 9", "ok"],
    ["Site induction, 14 Marsh Ave", "Complete", "ok"],
    ["Crane inspection, Level 3", "Complete", "ok"],
    ["SWMS, scaffold alteration", "3 workers unsigned", "flag"],
    ["EWP licence, M. Okafor", "Expires in 18 days", "soon"],
  ];
  return (
    <Frame title="Site board · 14 Marsh Ave">
      <ul>
        {rows.map(([name, status, kind], i) => (
          <li
            key={name}
            style={{ animationDelay: `${0.5 + i * 0.28}s` }}
            className={`board-row flex items-center justify-between gap-4 border-b border-line px-5 py-4 text-sm last:border-0 ${
              kind === "flag" ? "bg-accent/25" : ""
            }`}
          >
            <span className="font-medium">{name}</span>
            <span className="flex shrink-0 items-center gap-1.5 text-ink-soft">
              {kind === "ok" && (
                <Icon name="check" className="h-4 w-4 text-ink" />
              )}
              {status}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between bg-tint px-5 py-3 font-mono text-xs uppercase tracking-widest">
        <span>3 clear</span>
        <span>1 unsigned</span>
        <span>1 expiring</span>
      </div>
    </Frame>
  );
}

export function SwmsMock() {
  const steps: [string, string][] = [
    ["Erect formwork at height", "Fall from height"],
    ["Pump and place concrete", "Hose whip, manual handling"],
    ["Strip and stack formwork", "Struck by falling objects"],
  ];
  const signers: [string, boolean][] = [
    ["R. Dunn, foreman", true],
    ["T. Nguyen", true],
    ["M. Okafor", true],
    ["L. Petrov", false],
  ];
  return (
    <Frame title="SWMS · Formwork and concrete pour">
      <ul>
        {steps.map(([task, hazard]) => (
          <li
            key={task}
            className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5 text-sm"
          >
            <span className="font-medium">{task}</span>
            <span className="text-ink-soft">{hazard}</span>
          </li>
        ))}
      </ul>
      <div className="px-5 py-4">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">
          Signed on tablet at the gate
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {signers.map(([n, done]) => (
            <li key={n} className="flex items-center gap-3">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded border ${done ? "border-ink bg-ink text-bg" : "border-ink-soft"}`}
              >
                {done && <Icon name="check" className="h-3.5 w-3.5" />}
              </span>
              <span className={done ? "text-ink-soft" : "font-medium"}>
                {n}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-tint px-5 py-3 font-mono text-xs uppercase tracking-widest">
        Work cannot start until all four have signed
      </div>
    </Frame>
  );
}

export function TicketsMock() {
  const rows: [string, string, number, string][] = [
    ["R. Dunn", "General construction induction", 100, "No expiry"],
    ["M. Okafor", "EWP licence (WP)", 12, "Expires in 18 days"],
    ["T. Nguyen", "Dogging licence (DG)", 75, "Valid"],
    [
      "Apex Scaffolding",
      "Public liability, WorkCover",
      30,
      "Insurer renewal due",
    ],
  ];
  return (
    <Frame title="Tickets and licences · Marsh Ave crew">
      <ul>
        {rows.map(([name, role, pct, status]) => (
          <li
            key={name}
            className="border-b border-line px-5 py-4 last:border-0"
          >
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold">{name}</span>
              <span className="text-ink-soft">{status}</span>
            </div>
            <p className="text-xs text-ink-soft">{role}</p>
            <div className="mt-2 h-1.5 rounded-full bg-tint">
              <div
                className={`h-full rounded-full ${pct < 50 ? "bg-accent" : "bg-ink"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

export function IncidentMock() {
  const steps: [string, boolean][] = [
    ["Reported from the site, with photos", true],
    ["Area made safe and recorded", true],
    ["Injured worker and witnesses noted", true],
    ["Regulator notification assessed", true],
    ["Investigation and corrective actions", false],
    ["Closed out by the site manager", false],
  ];
  return (
    <Frame title="Incident · Near miss, Level 3">
      <ul>
        {steps.map(([label, done]) => (
          <li
            key={label}
            className="flex items-center gap-3 border-b border-line px-5 py-3.5 text-sm last:border-0"
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded border ${done ? "border-ink bg-ink text-bg" : "border-ink-soft"}`}
            >
              {done && <Icon name="check" className="h-3.5 w-3.5" />}
            </span>
            <span
              className={
                done
                  ? "text-ink-soft line-through decoration-ink-soft/50"
                  : "font-medium"
              }
            >
              {label}
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

export function SiteTrailMock({ dark = false }: { dark?: boolean }) {
  const events: [string, string][] = [
    ["06:48", "L. Petrov signed on at the gate"],
    ["06:52", "Induction for 14 Marsh Ave confirmed"],
    ["07:05", "SWMS, scaffold alteration, signed by foreman"],
    ["10:20", "Near miss reported, Level 3, photos attached"],
    ["10:31", "Site manager reviewed, corrective action assigned"],
  ];
  return (
    <Frame title="Audit log · 14 Marsh Ave" dark={dark}>
      <ol className="px-5 py-4">
        {events.map(([t, e]) => (
          <li key={t} className="flex gap-4 py-2 text-sm">
            <span
              className={`font-mono text-xs leading-6 ${dark ? "text-bg/60" : "text-ink-soft"}`}
            >
              {t}
            </span>
            <span className="relative pl-5 before:absolute before:left-0 before:top-2.5 before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent">
              {e}
            </span>
          </li>
        ))}
      </ol>
    </Frame>
  );
}
