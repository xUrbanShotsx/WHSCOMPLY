import {
  daysUntil,
  expiryOf,
  type Action,
  type Incident,
  type Risk,
  type Subcontractor,
  type Swms,
  type Talk,
  type Worker,
} from "./data";

export type Attention = {
  id: string;
  kind:
    "ticket" | "insurance" | "swms" | "action" | "risk" | "incident" | "talk";
  title: string;
  where: string;
  due: string;
  href: string;
  tone: "owed" | "neutral";
  /** lower sorts first */
  rank: number;
  who: string;
  projectId?: string;
};

const dueText = (d: number) =>
  d < 0
    ? `Overdue ${-d} day${d === -1 ? "" : "s"}`
    : d === 0
      ? "Due today"
      : `In ${d} day${d === 1 ? "" : "s"}`;

type Input = {
  workers: Worker[];
  subs: Subcontractor[];
  swms: Swms[];
  actions: Action[];
  risks: Risk[];
  incidents: Incident[];
  talks: Talk[];
  warnDays: number;
  notify: {
    tickets: boolean;
    insurances: boolean;
    actions: boolean;
    incidents: boolean;
  };
  projectName: (id: string) => string;
};

const ini = (n: string) =>
  n
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export function attentionFor(i: Input): Attention[] {
  const out: Attention[] = [];

  if (i.notify.tickets)
    for (const w of i.workers)
      for (const t of w.tickets) {
        const e = expiryOf(t.expires, i.warnDays);
        if (e !== "soon" && e !== "expired") continue;
        const d = daysUntil(t.expires as string);
        out.push({
          id: `t-${t.id}`,
          kind: "ticket",
          title: `${w.name}, ${t.kind}`,
          where:
            e === "expired" ? "Expired. Flag at sign-on" : "Ticket expiring",
          due: e === "expired" ? `Expired ${-d} days ago` : `In ${d} days`,
          href: "/dashboard/people",
          tone: "owed",
          rank: d,
          who: ini(w.name),
        });
      }

  if (i.notify.insurances)
    for (const s of i.subs)
      for (const d of s.docs) {
        const e = expiryOf(d.expires, i.warnDays);
        if (e !== "soon" && e !== "expired") continue;
        const n = daysUntil(d.expires as string);
        out.push({
          id: `d-${d.id}`,
          kind: "insurance",
          title: `${s.name}, ${d.kind}`,
          where:
            e === "expired"
              ? "Expired. Subcontractor on site"
              : "Document expiring",
          due: e === "expired" ? `Expired ${-n} days ago` : `In ${n} days`,
          href: "/dashboard/subcontractors",
          tone: "owed",
          rank: n,
          who: ini(s.name),
        });
      }

  for (const s of i.swms) {
    if (s.status !== "Active") continue;
    const owed = s.required.filter((w) => !s.signed.includes(w)).length;
    if (!owed) continue;
    out.push({
      id: `sw-${s.id}`,
      kind: "swms",
      title: `${s.title}: ${owed} unsigned`,
      where: i.projectName(s.projectId),
      due: "Before work starts",
      href: `/dashboard/swms/${s.id}`,
      tone: "owed",
      rank: -1,
      who: ini(s.owner),
      projectId: s.projectId,
    });
  }

  if (i.notify.actions)
    for (const a of i.actions) {
      if (a.status !== "Open") continue;
      const d = daysUntil(a.due);
      if (d > 7) continue;
      out.push({
        id: `a-${a.id}`,
        kind: "action",
        title: a.title,
        where: `${a.source}: ${a.sourceLabel}`,
        due: dueText(d),
        href: "/dashboard/actions",
        tone: d <= 0 ? "owed" : "neutral",
        rank: d,
        who: ini(a.owner),
        projectId: a.projectId,
      });
    }

  for (const r of i.risks) {
    if (r.status === "Closed") continue;
    const d = daysUntil(r.review);
    if (d > 7) continue;
    out.push({
      id: `r-${r.id}`,
      kind: "risk",
      title: `Review risk: ${r.hazard}`,
      where: i.projectName(r.projectId),
      due: dueText(d),
      href: "/dashboard/risks",
      tone: d <= 0 ? "owed" : "neutral",
      rank: d,
      who: ini(r.owner),
      projectId: r.projectId,
    });
  }

  if (i.notify.incidents)
    for (const n of i.incidents) {
      if (n.status === "Closed") continue;
      out.push({
        id: `i-${n.id}`,
        kind: "incident",
        title: n.title,
        where: `${n.type} · ${n.status}`,
        due: n.notifiable === null ? "Assess notifiability" : n.status,
        href: `/dashboard/incidents/${n.id}`,
        tone:
          n.notifiable === null || n.severity === "High" ? "owed" : "neutral",
        rank: 0,
        who: ini(n.reporter),
        projectId: n.projectId,
      });
    }

  for (const t of i.talks) {
    const d = daysUntil(t.date);
    if (d < 0 || d > 7) continue;
    out.push({
      id: `tb-${t.id}`,
      kind: "talk",
      title: `Toolbox talk: ${t.topic}`,
      where: i.projectName(t.projectId),
      due: dueText(d),
      href: "/dashboard/toolbox",
      tone: "neutral",
      rank: d + 2,
      who: ini(t.presenter),
      projectId: t.projectId,
    });
  }

  return out.sort((a, b) => a.rank - b.rank);
}
