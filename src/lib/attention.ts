import { todayISO } from "./format";
import {
  daysUntil,
  expiryOf,
  type Action,
  type Chemical,
  type Defect,
  type Inspection,
  type InspectionSchedule,
  type Rfi,
  type Doc,
  type Drill,
  type Permit,
  type Plant,
  type Visitor,
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
    | "ticket"
    | "insurance"
    | "swms"
    | "action"
    | "risk"
    | "incident"
    | "talk"
    | "permit"
    | "plant"
    | "chemical"
    | "drill"
    | "doc"
    | "visitor"
    | "defect"
    | "rfi"
    | "inspection";
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
  permits: Permit[];
  plant: Plant[];
  chemicals: Chemical[];
  drills: Drill[];
  docs: Doc[];
  visitors: Visitor[];
  defects: Defect[];
  rfis: Rfi[];
  schedules: InspectionSchedule[];
  inspections: Inspection[];
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

  for (const p of i.permits) {
    if (p.status === "Approved" && daysUntil(p.until) < 0)
      out.push({
        id: `pm-${p.id}`,
        kind: "permit",
        title: `Permit still open: ${p.title}`,
        where: `${p.kind} · ${i.projectName(p.projectId)}`,
        due: `Expired ${-daysUntil(p.until)} day${daysUntil(p.until) === -1 ? "" : "s"} ago`,
        href: "/dashboard/permits",
        tone: "owed",
        rank: daysUntil(p.until),
        who: ini(p.issuedTo),
        projectId: p.projectId,
      });
    else if (p.status === "Requested")
      out.push({
        id: `pm-${p.id}`,
        kind: "permit",
        title: `Permit awaiting approval: ${p.title}`,
        where: `${p.kind} · ${i.projectName(p.projectId)}`,
        due: dueText(daysUntil(p.from)),
        href: "/dashboard/permits",
        tone: "neutral",
        rank: daysUntil(p.from),
        who: ini(p.requestedBy),
        projectId: p.projectId,
      });
  }

  for (const p of i.plant) {
    if (p.status === "Out of service")
      out.push({
        id: `pl-${p.id}-oos`,
        kind: "plant",
        title: `${p.name} is out of service`,
        where: p.defect || i.projectName(p.projectId),
        due: "Defect open",
        href: "/dashboard/plant",
        tone: "owed",
        rank: -2,
        who: ini(p.name),
        projectId: p.projectId,
      });
    if (p.status === "Off site") continue;
    const svc = daysUntil(p.nextService);
    if (svc <= 7)
      out.push({
        id: `pl-${p.id}-svc`,
        kind: "plant",
        title: `Service due: ${p.name}`,
        where: i.projectName(p.projectId),
        due: dueText(svc),
        href: "/dashboard/plant",
        tone: svc < 0 ? "owed" : "neutral",
        rank: svc,
        who: ini(p.name),
        projectId: p.projectId,
      });
    if (p.tagDue) {
      const tag = daysUntil(p.tagDue);
      if (tag <= 7)
        out.push({
          id: `pl-${p.id}-tag`,
          kind: "plant",
          title: `Test and tag due: ${p.name}`,
          where: i.projectName(p.projectId),
          due: dueText(tag),
          href: "/dashboard/plant",
          tone: tag < 0 ? "owed" : "neutral",
          rank: tag,
          who: ini(p.name),
          projectId: p.projectId,
        });
    }
  }

  for (const c of i.chemicals) {
    if (c.status !== "In use") continue;
    if (!c.hasSds)
      out.push({
        id: `ch-${c.id}`,
        kind: "chemical",
        title: `No safety data sheet: ${c.name}`,
        where: i.projectName(c.projectId),
        due: "Obtain from supplier",
        href: "/dashboard/chemicals",
        tone: "owed",
        rank: -1,
        who: ini(c.supplier),
        projectId: c.projectId,
      });
    else if (c.sdsDate && daysUntil(c.sdsDate) < -1825)
      out.push({
        id: `ch-${c.id}`,
        kind: "chemical",
        title: `Safety data sheet over 5 years old: ${c.name}`,
        where: i.projectName(c.projectId),
        due: "Request a current SDS",
        href: "/dashboard/chemicals",
        tone: "owed",
        rank: -1,
        who: ini(c.supplier),
        projectId: c.projectId,
      });
  }

  for (const d of i.drills) {
    const later = i.drills.some(
      (x) =>
        x.projectId === d.projectId && x.kind === d.kind && x.date > d.date,
    );
    if (later) continue;
    const n = daysUntil(d.nextDue);
    if (n > 14) continue;
    out.push({
      id: `dr-${d.id}`,
      kind: "drill",
      title: `${d.kind} due`,
      where: i.projectName(d.projectId),
      due: dueText(n),
      href: "/dashboard/emergency",
      tone: n < 0 ? "owed" : "neutral",
      rank: n,
      who: ini(d.by),
      projectId: d.projectId,
    });
  }

  for (const d of i.docs) {
    const n = daysUntil(d.reviewDue);
    if (n > 14) continue;
    out.push({
      id: `dc-${d.id}`,
      kind: "doc",
      title: `Review due: ${d.title}`,
      where:
        d.projectId === "all" ? "Whole business" : i.projectName(d.projectId),
      due: dueText(n),
      href: "/dashboard/documents",
      tone: n < 0 ? "owed" : "neutral",
      rank: n,
      who: ini(d.owner),
      projectId: d.projectId,
    });
  }

  for (const v of i.visitors) {
    if (v.outAt || v.inAt.slice(0, 10) >= todayISO()) continue;
    out.push({
      id: `v-${v.id}`,
      kind: "visitor",
      title: `Visitor never signed out: ${v.name}`,
      where: i.projectName(v.projectId),
      due: "Signed in on an earlier day",
      href: "/dashboard/visitors",
      tone: "owed",
      rank: -1,
      who: ini(v.name),
      projectId: v.projectId,
    });
  }

  for (const d of i.defects) {
    if (d.status === "Closed") continue;
    const n = daysUntil(d.due);
    if (d.priority !== "Critical" && n > 3) continue;
    out.push({
      id: `df-${d.id}`,
      kind: "defect",
      title: `${d.priority === "Critical" ? "Critical defect" : "Defect"}: ${d.title}`,
      where: `${d.location} · ${d.assignee}`,
      due: dueText(n),
      href: "/dashboard/defects",
      tone: d.priority === "Critical" || n < 0 ? "owed" : "neutral",
      rank: d.priority === "Critical" ? -3 : n,
      who: ini(d.assignee || "Defect"),
      projectId: d.projectId,
    });
  }

  for (const r of i.rfis) {
    if (r.status !== "Open") continue;
    const n = daysUntil(r.due);
    if (n > 2) continue;
    out.push({
      id: `rf-${r.id}`,
      kind: "rfi",
      title: `${r.number} unanswered: ${r.subject}`,
      where: `To ${r.to} · ${i.projectName(r.projectId)}`,
      due: dueText(n),
      href: "/dashboard/rfis",
      tone: n < 0 ? "owed" : "neutral",
      rank: n,
      who: ini(r.raisedBy),
      projectId: r.projectId,
    });
  }

  for (const sc of i.schedules) {
    const last = i.inspections
      .filter((x) => x.projectId === sc.projectId && x.kind === sc.kind)
      .map((x) => x.date)
      .sort()
      .pop();
    const n = last ? daysUntil(last) + sc.everyDays : 0;
    if (n > 0) continue;
    out.push({
      id: `sc-${sc.id}`,
      kind: "inspection",
      title: `${sc.kind} due`,
      where: i.projectName(sc.projectId),
      due: n === 0 ? "Due today" : `Overdue ${-n} day${n === -1 ? "" : "s"}`,
      href: "/dashboard/inspections",
      tone: "owed",
      rank: n - 1,
      who: ini(sc.kind),
      projectId: sc.projectId,
    });
  }

  return out.sort((a, b) => a.rank - b.rank);
}
