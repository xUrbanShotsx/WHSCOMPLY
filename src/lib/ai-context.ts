import {
  daysUntil,
  expiryOf,
  rating,
  type Action,
  type AuditEvent,
  type Chemical,
  type Defect,
  type DiaryEntry,
  type Drawing,
  type Notice,
  type ProgTask,
  type Rfi,
  type Doc,
  type Drill,
  type Incident,
  type Inspection,
  type Permit,
  type Plant,
  type Project,
  type Risk,
  type Subcontractor,
  type Swms,
  type Talk,
  type Visitor,
  type Worker,
} from "./data";

export type ContextInput = {
  scopeLabel: string;
  today: string;
  company: string;
  projects: Project[];
  workers: Worker[];
  subs: Subcontractor[];
  swms: Swms[];
  risks: Risk[];
  talks: Talk[];
  permits: Permit[];
  plant: Plant[];
  chemicals: Chemical[];
  drills: Drill[];
  visitors: Visitor[];
  docs: Doc[];
  inspections: Inspection[];
  incidents: Incident[];
  actions: Action[];
  audit: AuditEvent[];
  allProjects: Project[];
  defects: Defect[];
  rfis: Rfi[];
  tasks: ProgTask[];
  diaries: DiaryEntry[];
  notices: Notice[];
  drawings: Drawing[];
};

/** A compact plain-text picture of the business, narrowed to the selected project, for the AI to read. */
export function buildContext(c: ContextInput): string {
  const name = (id: string) =>
    c.allProjects.find((p) => p.id === id)?.name ??
    (id === "all" ? "Whole business" : id);
  const out: string[] = [];
  const due = (iso: string) => {
    const d = daysUntil(iso);
    return d < 0
      ? `${iso} (${-d} days overdue)`
      : d === 0
        ? `${iso} (today)`
        : `${iso} (in ${d} days)`;
  };

  out.push(
    `Today is ${c.today}. Business: ${c.company}. Selected scope: ${c.scopeLabel}.`,
  );

  out.push("\nPROJECTS:");
  for (const p of c.projects)
    out.push(
      `- ${p.name} (${p.status}), ${p.address}, client ${p.client}, stage ${p.stage}, manager ${p.manager}, ${p.onSite.length} signed on now, ${p.hours} hours worked. Emergency: assembly ${p.assembly || "not set"}, hospital ${p.hospital || "not set"}.`,
    );

  out.push("\nWORKERS AND TICKETS:");
  for (const w of c.workers) {
    const issues = w.tickets
      .map((t) => ({ t, e: expiryOf(t.expires, 45) }))
      .filter((x) => x.e === "soon" || x.e === "expired")
      .map(
        (x) =>
          `${x.t.kind} ${x.e === "expired" ? "EXPIRED" : "expires"} ${x.t.expires}`,
      );
    out.push(
      `- ${w.name}, ${w.role}, projects: ${w.projects.map(name).join(", ") || "none"}, inducted: ${w.inducted.map(name).join(", ") || "none"}${issues.length ? `. ISSUES: ${issues.join("; ")}` : ". Tickets current"}`,
    );
  }

  out.push("\nSUBCONTRACTORS:");
  for (const s of c.subs) {
    const issues = s.docs
      .map((d) => ({ d, e: expiryOf(d.expires, 45) }))
      .filter((x) => x.e === "soon" || x.e === "expired")
      .map(
        (x) =>
          `${x.d.kind} ${x.e === "expired" ? "EXPIRED" : "expires"} ${x.d.expires}`,
      );
    out.push(
      `- ${s.name} (${s.trade}), ${s.approved ? "approved" : "NOT approved"}${issues.length ? `. ISSUES: ${issues.join("; ")}` : ""}`,
    );
  }

  out.push("\nSWMS:");
  for (const s of c.swms) {
    const owed = s.required.filter((w) => !s.signed.includes(w)).length;
    out.push(
      `- ${s.title} v${s.version}, ${s.status}, ${name(s.projectId)}, ${s.highRisk ? "high risk work" : "not high risk"}, ${s.steps.length} steps, signed ${s.signed.length}/${s.required.length}${owed && s.status === "Active" ? `, ${owed} UNSIGNED` : ""}. Steps: ${s.steps.map((st) => `${st.task} [${st.risk}]`).join("; ")}`,
    );
  }

  out.push("\nRISK REGISTER:");
  for (const r of c.risks)
    out.push(
      `- ${r.hazard} (${name(r.projectId)}, ${r.category}), inherent ${rating(r.likelihood, r.consequence)}, residual ${rating(r.resL, r.resC)}, ${r.status}, owner ${r.owner}, review ${due(r.review)}`,
    );

  out.push("\nPERMITS TO WORK:");
  for (const p of c.permits)
    out.push(
      `- ${p.title} (${p.kind}, ${name(p.projectId)}), ${p.status}, valid ${p.from} to ${p.until}, checks ${p.checks.filter((x) => x.done).length}/${p.checks.length}`,
    );

  out.push("\nPLANT AND EQUIPMENT:");
  for (const p of c.plant)
    out.push(
      `- ${p.name} (${p.kind}, ${name(p.projectId)}), ${p.status}${p.defect ? `, defect: ${p.defect}` : ""}, service due ${due(p.nextService)}${p.tagDue ? `, test and tag ${due(p.tagDue)}` : ""}`,
    );

  out.push("\nHAZARDOUS CHEMICALS:");
  for (const h of c.chemicals)
    out.push(
      `- ${h.name} (${h.hazard}, ${name(h.projectId)}), ${h.status}, ${h.hasSds ? `SDS dated ${h.sdsDate}` : "NO SDS ON FILE"}`,
    );

  out.push("\nINSPECTIONS:");
  for (const i of c.inspections) {
    const fails = i.items.filter((x) => x.result === "fail").map((x) => x.text);
    out.push(
      `- ${i.title} (${name(i.projectId)}), ${i.date}, ${i.status}, ${i.items.filter((x) => x.result).length}/${i.items.length} checked${fails.length ? `, FAILED: ${fails.join("; ")}` : ""}`,
    );
  }

  out.push("\nINCIDENTS:");
  for (const i of c.incidents)
    out.push(
      `- ${i.title} (${i.type}, ${i.severity}, ${name(i.projectId)}), ${i.date} ${i.time}, ${i.location}, status ${i.status}, notifiable ${i.notifiable === null ? "NOT ASSESSED" : i.notifiable ? "yes" : "no"}${i.lostTime ? ", lost time injury" : ""}. ${i.description}${i.cause ? ` Cause: ${i.cause}` : ""}`,
    );

  out.push("\nCORRECTIVE ACTIONS:");
  for (const a of c.actions)
    out.push(
      `- ${a.title} (${name(a.projectId)}), owner ${a.owner}, ${a.status === "Done" ? "done" : `OPEN, due ${due(a.due)}`}, from ${a.source}: ${a.sourceLabel}`,
    );

  out.push("\nTOOLBOX TALKS AND MEETINGS:");
  for (const t of c.talks)
    out.push(
      `- ${t.kind ?? "Toolbox talk"}: ${t.topic} (${name(t.projectId)}), ${t.date}, attended ${t.attended.length}/${t.expected.length}`,
    );

  out.push("\nDOCUMENTS:");
  for (const d of c.docs)
    out.push(
      `- ${d.title} v${d.version} (${d.category}, ${name(d.projectId)}), review ${due(d.reviewDue)}, signed by ${d.signed.length}`,
    );

  out.push("\nEMERGENCY DRILLS:");
  for (const d of c.drills)
    out.push(
      `- ${d.kind} (${name(d.projectId)}), held ${d.date}, next due ${due(d.nextDue)}`,
    );

  out.push("\nVISITORS ON SITE:");
  for (const v of c.visitors.filter((x) => !x.outAt))
    out.push(`- ${v.name}, ${v.company} (${name(v.projectId)}), in ${v.inAt}`);

  out.push("\nDEFECTS:");
  for (const d of c.defects)
    out.push(
      `- ${d.title} (${d.priority}, ${name(d.projectId)}, ${d.location}), ${d.status}, assigned ${d.assignee}, due ${due(d.due)}`,
    );

  out.push("\nRFIs:");
  for (const r of c.rfis)
    out.push(
      `- ${r.number} ${r.subject} (${name(r.projectId)}), to ${r.to}, ${r.status}, due ${due(r.due)}`,
    );

  out.push("\nPROGRAMME:");
  for (const t of c.tasks)
    out.push(
      `- ${t.name} (${t.trade}, ${name(t.projectId)}), ${t.start} to ${t.end}, ${t.progress}% done${t.needsSwms ? ", needs a SWMS" : ""}`,
    );

  out.push("\nDRAWINGS:");
  for (const d of c.drawings)
    out.push(
      `- ${d.number} ${d.title} (${name(d.projectId)}), current revision ${d.revisions[0]?.rev}`,
    );

  out.push("\nSITE NOTICES:");
  for (const n of c.notices.slice(0, 8))
    out.push(
      `- ${n.title} (${n.priority}, ${name(n.projectId)}), read by ${n.readBy.length}`,
    );

  out.push("\nSITE DIARY (latest):");
  for (const d of [...c.diaries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6))
    out.push(
      `- ${d.date} ${name(d.projectId)}, ${d.weather}, ${d.workers.length} on site. ${d.summary}${d.delays ? ` Delays: ${d.delays}` : ""}${d.safety ? ` Safety: ${d.safety}` : ""}`,
    );

  out.push("\nRECENT ACTIVITY:");
  for (const e of c.audit.slice(0, 15))
    out.push(`- ${e.day} ${e.t}: ${e.name} ${e.act}`);

  const text = out.join("\n");
  return text.length > 38_000 ? `${text.slice(0, 38_000)}\n[truncated]` : text;
}

export type Suggestion = { title: string; prompt: string };

/** Starting points on the Assistance page: each one is a job for the agent, not just a question. */
export const SUGGESTIONS: { label: string; items: Suggestion[] }[] = [
  {
    label: "Catch up",
    items: [
      {
        title: "What needs my attention?",
        prompt:
          "Go through all my projects and tell me what needs attention today, most urgent first: unsigned SWMS, expiring tickets, overdue actions, open incidents and anything out of service.",
      },
      {
        title: "Sweep for overdue items",
        prompt:
          "Sweep every project for anything overdue and raise the follow-up actions and notices needed. Show me each change to approve.",
      },
    ],
  },
  {
    label: "Get it done",
    items: [
      {
        title: "Fix a hazard",
        prompt:
          "A lead is damaged near the Level 2 stairs at 14 Marsh Ave. Log the hazard, raise an action to replace it by Friday and post a safety notice to the crew.",
      },
      {
        title: "Set up a toolbox talk",
        prompt:
          "Schedule a toolbox talk on silica dust for 14 Marsh Ave next week and write the key points for the foreman.",
      },
      {
        title: "Log a near miss",
        prompt:
          "Log a near miss: a pallet of bricks slipped off the hoist at Level 2 this morning. Nobody was under it. Raise the first corrective actions.",
      },
    ],
  },
  {
    label: "Report and ask",
    items: [
      {
        title: "Weekly summary for the client",
        prompt:
          "Look at the safety numbers and this week's activity for 14 Marsh Ave and write a short summary I can send to the client.",
      },
      {
        title: "Ask about the rules",
        prompt:
          "What does a SWMS need to contain for work at height, and is a near miss from a dropped object notifiable?",
      },
    ],
  },
];
