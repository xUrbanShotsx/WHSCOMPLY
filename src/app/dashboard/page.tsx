"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/Icons";
import { useScope } from "@/components/app/DemoStore";
import { IncidentForm } from "@/components/app/forms";
import {
  Avatar,
  btnDark,
  btnLight,
  Card,
  CardHead,
  EmptyState,
  PageHeading,
  Pill,
  RiskPill,
  Stat,
} from "@/components/app/ui";
import { useAttention } from "@/components/app/useAttention";
import { daysUntil, expiryOf, me, rating, type RiskLevel } from "@/lib/data";
import { fmtDate } from "@/lib/format";

const LEVELS: RiskLevel[] = ["Extreme", "High", "Medium", "Low"];

export default function DashboardHome() {
  const s = useScope();
  const attention = useAttention();
  const [reporting, setReporting] = useState(false);

  const onSite = useMemo(
    () => s.projectsIn.reduce((n, p) => n + p.onSite.length, 0),
    [s.projectsIn],
  );
  const unsigned = s.swmsIn
    .filter((x) => x.status === "Active")
    .reduce(
      (n, x) => n + x.required.filter((w) => !x.signed.includes(w)).length,
      0,
    );
  const openActions = s.actionsIn.filter((a) => a.status === "Open");
  const overdue = openActions.filter((a) => daysUntil(a.due) < 0).length;
  const openIncidents = s.incidentsIn.filter(
    (i) => i.status !== "Closed",
  ).length;

  const expiring = useMemo(() => {
    const rows: {
      id: string;
      who: string;
      what: string;
      date: string;
      d: number;
    }[] = [];
    for (const w of s.workersIn)
      for (const t of w.tickets) {
        const e = expiryOf(t.expires, 60);
        if ((e === "soon" || e === "expired") && t.expires)
          rows.push({
            id: t.id,
            who: w.name,
            what: t.kind,
            date: t.expires,
            d: daysUntil(t.expires),
          });
      }
    for (const sub of s.subsIn)
      for (const d of sub.docs) {
        const e = expiryOf(d.expires, 60);
        if ((e === "soon" || e === "expired") && d.expires)
          rows.push({
            id: d.id,
            who: sub.name,
            what: d.kind,
            date: d.expires,
            d: daysUntil(d.expires),
          });
      }
    return rows.sort((a, b) => a.d - b.d);
  }, [s.workersIn, s.subsIn]);

  const risk = useMemo(() => {
    const c: Record<RiskLevel, number> = {
      Extreme: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };
    for (const r of s.risksIn)
      if (r.status !== "Closed") c[rating(r.resL, r.resC)]++;
    return c;
  }, [s.risksIn]);
  const riskTotal = LEVELS.reduce((n, l) => n + risk[l], 0);

  const talks = s.talksIn
    .filter((t) => daysUntil(t.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeading
        title={`${greeting}, ${me.name.split(" ")[0]}`}
        sub={`Here is what needs you today on ${s.all ? "every project" : s.scopeLabel}.`}
        actions={
          <>
            <Link href="/dashboard/audit" className={btnLight}>
              <Icon name="download" className="h-4 w-4" /> Audit pack
            </Link>
            <button
              type="button"
              onClick={() => setReporting(true)}
              className={btnDark}
            >
              <Icon name="plus" className="h-4 w-4" /> Report incident
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat
          label="On site now"
          value={String(onSite)}
          note={
            s.all
              ? `across ${s.projectsIn.filter((p) => p.onSite.length).length} projects`
              : `${s.project?.stage ?? ""}`
          }
        />
        <Stat
          label="SWMS signatures owed"
          value={String(unsigned)}
          note={
            unsigned ? "Work cannot start until signed" : "Every crew is signed"
          }
          tone={unsigned ? "owed" : undefined}
        />
        <Stat
          label="Tickets and insurances expiring"
          value={String(expiring.length)}
          note={
            expiring[0]
              ? `${expiring[0].who}, ${expiring[0].d < 0 ? "expired" : `in ${expiring[0].d} days`}`
              : "None in 60 days"
          }
          tone={expiring.length ? "owed" : undefined}
        />
        <Stat
          label="Open actions"
          value={String(openActions.length)}
          note={`${overdue} overdue · ${openIncidents} open incident${openIncidents === 1 ? "" : "s"}`}
          tone={overdue ? "owed" : undefined}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHead
            title="Needs attention"
            sub="Overdue and due soon, ranked by urgency"
            right={
              <Pill tone={attention.length ? "owed" : "ok"}>
                {attention.length} items
              </Pill>
            }
          />
          {attention.length === 0 ? (
            <EmptyState
              title="Nothing needs you right now."
              body="Every SWMS is signed, nothing is expiring and no actions are overdue."
            />
          ) : (
            <ul>
              {attention.slice(0, 8).map((a) => (
                <li key={a.id} className="border-b border-line last:border-0">
                  <Link
                    href={a.href}
                    className="row-hover flex items-center gap-3 px-5 py-3.5"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-ink-soft/60" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {a.title}
                      </span>
                      <span className="block truncate text-xs text-ink-soft">
                        {a.where}
                      </span>
                    </span>
                    <Pill tone={a.tone}>{a.due}</Pill>
                    <Avatar initials={a.who} tone={1} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHead
            title="Who is on site"
            sub="Signed on at the gate right now"
            right={<Pill tone="neutral">{onSite} people</Pill>}
          />
          {s.projectsIn.length === 0 ? (
            <EmptyState title="No projects yet." />
          ) : (
            <ul>
              {s.projectsIn.map((p) => {
                const crew = s.workers.filter((w) => p.onSite.includes(w.id));
                return (
                  <li
                    key={p.id}
                    className="border-b border-line px-5 py-3.5 last:border-0"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <span className="text-xs text-ink-soft">
                        {p.onSite.length} on site
                      </span>
                    </div>
                    <div className="mt-2 flex -space-x-1.5">
                      {crew.slice(0, 8).map((w, i) => (
                        <span
                          key={w.id}
                          className="rounded-full ring-2 ring-surface"
                          title={w.name}
                        >
                          <Avatar
                            initials={w.name
                              .split(" ")
                              .map((x) => x[0])
                              .join("")}
                            tone={(i % 3) as 0 | 1 | 2}
                          />
                        </span>
                      ))}
                      {crew.length === 0 && (
                        <span className="text-xs text-ink-soft">
                          No one signed on
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHead
            title="Risk profile"
            sub="Open risks by residual rating"
            right={
              <Link
                href="/dashboard/risks"
                className="text-xs font-semibold underline"
              >
                Register
              </Link>
            }
          />
          <div className="px-5 py-4">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-tint">
              {LEVELS.map((l) => (
                <span
                  key={l}
                  className={
                    l === "Extreme"
                      ? "bg-ink"
                      : l === "High"
                        ? "bg-accent"
                        : l === "Medium"
                          ? "bg-accent/40"
                          : "bg-line"
                  }
                  style={{
                    width: riskTotal ? `${(risk[l] / riskTotal) * 100}%` : "0%",
                  }}
                />
              ))}
            </div>
            <ul className="mt-4 space-y-2">
              {LEVELS.map((l) => (
                <li
                  key={l}
                  className="flex items-center justify-between text-sm"
                >
                  <RiskPill level={l} />
                  <span className="font-semibold tabular-nums">{risk[l]}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card>
          <CardHead
            title="Expiring soon"
            sub="Tickets and insurances, next 60 days"
          />
          {expiring.length === 0 ? (
            <EmptyState title="Nothing is expiring." />
          ) : (
            <ul>
              {expiring.slice(0, 5).map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 border-b border-line px-5 py-3 last:border-0"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {r.who}
                    </span>
                    <span className="block truncate text-xs text-ink-soft">
                      {r.what} · {fmtDate(r.date)}
                    </span>
                  </span>
                  <Pill tone={r.d < 0 ? "solid" : "owed"}>
                    {r.d < 0 ? "Expired" : `${r.d} days`}
                  </Pill>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHead
            title="Recent activity"
            sub="From the audit log"
            right={
              <Link
                href="/dashboard/audit"
                className="text-xs font-semibold underline"
              >
                All
              </Link>
            }
          />
          <ol>
            {s.auditIn.slice(0, 5).map((e) => (
              <li
                key={e.id}
                className="flex gap-3 border-b border-line px-5 py-3 last:border-0"
              >
                <Avatar initials={e.who} tone={1} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-semibold">{e.name}</span>{" "}
                    <span className="text-ink-soft">{e.act}</span>
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-ink-soft">
                    {e.day} · {e.t}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {talks.length > 0 && (
        <Card className="mt-6">
          <CardHead
            title="Upcoming toolbox talks"
            right={
              <Link
                href="/dashboard/toolbox"
                className="text-xs font-semibold underline"
              >
                All talks
              </Link>
            }
          />
          <ul className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {talks.map((t) => (
              <li key={t.id} className="px-5 py-4">
                <p className="truncate text-sm font-semibold">{t.topic}</p>
                <p className="mt-0.5 truncate text-xs text-ink-soft">
                  {s.projects.find((p) => p.id === t.projectId)?.name} ·{" "}
                  {fmtDate(t.date)}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {reporting && <IncidentForm onClose={() => setReporting(false)} />}
    </>
  );
}
