import type { useStore } from "@/components/app/DemoStore";
import { toolByName } from "@/lib/agent-tools";
import {
  addDays,
  daysUntil,
  expiryOf,
  INSPECTION_TEMPLATES,
  me,
  PERMIT_CHECKS,
  rating,
  RISK_CATEGORIES,
  WEATHER,
  type IncidentType,
  type MeetingKind,
  type PermitKind,
  type RiskLevel,
  type Weather,
} from "@/lib/data";
import { fmtDate, todayISO } from "@/lib/format";

export type AppStore = ReturnType<typeof useStore>;
export type Input = Record<string, unknown>;
export type Outcome = {
  ok: boolean;
  /** What goes back to the model. */
  text: string;
  /** Short plain sentence for the person. */
  outcome?: string;
  link?: { path: string; label: string };
};

const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const json = (v: unknown) => JSON.stringify(v).slice(0, 12_000);
const fail = (text: string): Outcome => ({ ok: false, text, outcome: text });
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const isTime = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const norm = (v: string) => v.trim().toLowerCase();
const num = (v: unknown, lo: number, hi: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= lo && n <= hi ? n : null;
};
const oneOf = <T extends string>(v: unknown, list: readonly T[]) =>
  list.find((x) => norm(x) === norm(s(v)));

const projectName = (store: AppStore, id: string) =>
  id === "all"
    ? "the whole business"
    : (store.projects.find((p) => p.id === id)?.name ?? id);
const workerName = (store: AppStore, id: string) =>
  store.workers.find((w) => w.id === id)?.name ?? id;

/** Plain words for a step, used on approval cards and in the activity trail. */
export function describeTool(
  name: string,
  input: Input,
  store: AppStore,
): { title: string; detail?: string } {
  const proj = projectName(store, s(input.project_id));
  switch (name) {
    case "list_projects":
      return { title: "Looking up projects" };
    case "list_workers":
      return { title: "Checking workers and tickets" };
    case "list_subcontractors":
      return { title: "Checking subcontractors" };
    case "list_swms":
      return { title: "Checking SWMS" };
    case "list_risks":
      return { title: "Reading the risk register" };
    case "list_permits":
      return { title: "Checking permits to work" };
    case "list_plant":
      return { title: "Checking plant and equipment" };
    case "list_chemicals":
      return { title: "Checking hazardous chemicals" };
    case "list_inspections":
      return { title: "Checking inspections" };
    case "list_incidents":
      return { title: "Checking incidents" };
    case "list_actions":
      return { title: "Checking corrective actions" };
    case "list_meetings":
      return { title: "Checking toolbox talks and meetings" };
    case "list_defects":
      return { title: "Checking defects" };
    case "list_rfis":
      return { title: "Checking RFIs" };
    case "list_diary":
      return { title: "Reading the site diary" };
    case "list_programme":
      return { title: "Checking the programme" };
    case "list_documents":
      return { title: "Checking documents and policies" };
    case "list_drawings":
      return { title: "Checking drawings" };
    case "list_notices":
      return { title: "Checking site notices" };
    case "list_visitors":
      return { title: "Checking visitors" };
    case "list_emergency":
      return { title: "Checking emergency details" };
    case "safety_stats":
      return { title: "Working out safety numbers" };
    case "list_audit":
      return { title: "Reading the audit log" };
    case "open_page":
      return { title: "Linking a page", detail: s(input.label) };

    case "create_action":
      return {
        title: "Raise a corrective action",
        detail: [
          s(input.title),
          `Owner ${s(input.owner)}`,
          s(input.due) && `Due ${fmtDate(s(input.due))}`,
          proj,
        ]
          .filter(Boolean)
          .join(" · "),
      };
    case "set_action_status": {
      const a = store.actions.find((x) => x.id === s(input.action_id));
      return {
        title: "Change an action's status",
        detail: `${a?.title ?? s(input.action_id)} → ${s(input.status)}`,
      };
    }
    case "report_incident":
      return {
        title: `Report a ${norm(s(input.type)) || "incident"}`,
        detail: [s(input.title), s(input.severity), s(input.location), proj]
          .filter(Boolean)
          .join(" · "),
      };
    case "add_risk":
      return {
        title: "Add to the risk register",
        detail: [s(input.hazard), s(input.category), proj]
          .filter(Boolean)
          .join(" · "),
      };
    case "schedule_talk":
      return {
        title: `Schedule a ${norm(s(input.kind) || "Toolbox talk")}`,
        detail: [s(input.topic), s(input.date) && fmtDate(s(input.date)), proj]
          .filter(Boolean)
          .join(" · "),
      };
    case "log_defect":
      return {
        title: "Log a defect",
        detail: [
          s(input.title),
          s(input.priority),
          s(input.location),
          `For ${s(input.assignee)}`,
          proj,
        ]
          .filter(Boolean)
          .join(" · "),
      };
    case "set_defect_status": {
      const d = store.defects.find((x) => x.id === s(input.defect_id));
      return {
        title: "Move a defect",
        detail: `${d?.title ?? s(input.defect_id)} → ${s(input.status)}`,
      };
    }
    case "raise_rfi":
      return {
        title: "Raise an RFI",
        detail: [s(input.subject), `To ${s(input.to)}`, proj]
          .filter(Boolean)
          .join(" · "),
      };
    case "add_diary_entry":
      return {
        title: "Write a site diary entry",
        detail: [s(input.summary), proj].filter(Boolean).join(" · "),
      };
    case "post_notice":
      return {
        title: "Post a site notice",
        detail: [s(input.title), s(input.priority), proj]
          .filter(Boolean)
          .join(" · "),
      };
    case "sign_on_worker":
      return {
        title: "Sign a worker on",
        detail: `${workerName(store, s(input.worker_id))} · ${proj}`,
      };
    case "sign_off_worker":
      return {
        title: "Sign a worker off",
        detail: `${workerName(store, s(input.worker_id))} · ${proj}`,
      };
    case "add_programme_task":
      return {
        title: "Add a programme task",
        detail: [
          s(input.name),
          `${fmtDate(s(input.start))} to ${fmtDate(s(input.end))}`,
          proj,
        ].join(" · "),
      };
    case "sign_in_visitor":
      return {
        title: "Sign in a visitor",
        detail: [s(input.name), s(input.company), s(input.purpose), proj]
          .filter(Boolean)
          .join(" · "),
      };
    case "request_permit":
      return {
        title: `Request a ${norm(s(input.kind))} permit`,
        detail: [s(input.title), `For ${s(input.issued_to)}`, proj]
          .filter(Boolean)
          .join(" · "),
      };
    case "start_inspection":
      return {
        title: "Start an inspection",
        detail: [s(input.kind), `Inspector ${s(input.inspector)}`, proj]
          .filter(Boolean)
          .join(" · "),
      };
    default:
      return { title: name };
  }
}

const pidIn = (store: AppStore, input: Input) => {
  const id = s(input.project_id);
  return id && store.projects.some((p) => p.id === id) ? id : "";
};
const BAD_PROJECT = "No project with that id. Call list_projects.";

/** Runs one tool against the workspace in this browser. Never throws: problems come back as errors the model can read. */
export async function executeTool(
  name: string,
  input: Input,
  store: AppStore,
): Promise<Outcome> {
  if (!toolByName(name)) return fail(`Unknown tool ${name}.`);
  const today = todayISO();
  const warn = store.settings.warnDays;
  const pname = (id: string) => projectName(store, id);
  const inProject = <T extends { projectId: string }>(rows: T[]) => {
    const id = s(input.project_id);
    return id ? rows.filter((r) => r.projectId === id) : rows;
  };

  try {
    switch (name) {
      /* ---------- look things up ---------- */
      case "list_projects":
        return {
          ok: true,
          text: json(
            store.projects.map((p) => ({
              id: p.id,
              name: p.name,
              status: p.status,
              stage: p.stage,
              manager: p.manager,
              client: p.client,
              signedOnNow: p.onSite.length,
              hoursWorked: p.hours,
            })),
          ),
        };
      case "list_workers": {
        const id = s(input.project_id);
        const rows = store.workers
          .filter((w) => !id || w.projects.includes(id))
          .map((w) => ({
            w,
            issues: w.tickets
              .map((t) => ({ t, e: expiryOf(t.expires, warn) }))
              .filter((x) => x.e === "expired" || x.e === "soon")
              .map(
                (x) =>
                  `${x.t.kind} ${x.e === "expired" ? "EXPIRED" : "expires"} ${x.t.expires}`,
              ),
          }))
          .filter((x) => !input.issues_only || x.issues.length)
          .map(({ w, issues }) => ({
            id: w.id,
            name: w.name,
            role: w.role,
            employer:
              w.company === "own"
                ? store.settings.company.name
                : (store.subs.find((x) => x.id === w.company)?.name ??
                  w.company),
            projects: w.projects.map(pname),
            inductedTo: w.inducted.map(pname),
            signedOnAt: store.projects
              .filter((p) => p.onSite.includes(w.id))
              .map((p) => p.name),
            ticketIssues: issues,
          }));
        return { ok: true, text: json(rows) };
      }
      case "list_subcontractors":
        return {
          ok: true,
          text: json(
            store.subs.map((x) => {
              const q = x.prequal ?? [];
              return {
                id: x.id,
                name: x.name,
                trade: x.trade,
                approved: x.approved,
                projects: x.projects.map(pname),
                prequalification: q.length
                  ? `${q.filter((i) => i.done).length} of ${q.length} checked`
                  : x.approved
                    ? "complete"
                    : "not started",
                documentIssues: x.docs
                  .map((d) => ({ d, e: expiryOf(d.expires, warn) }))
                  .filter((y) => y.e === "expired" || y.e === "soon")
                  .map(
                    (y) =>
                      `${y.d.kind} ${y.e === "expired" ? "EXPIRED" : "expires"} ${y.d.expires}`,
                  ),
              };
            }),
          ),
        };
      case "list_swms": {
        const rows = inProject(store.swms)
          .map((x) => ({
            x,
            unsigned: x.required
              .filter((w) => !x.signed.includes(w))
              .map((w) => workerName(store, w)),
          }))
          .filter(
            (r) =>
              !input.unsigned_only ||
              (r.x.status === "Active" && r.unsigned.length),
          )
          .map(({ x, unsigned }) => ({
            id: x.id,
            title: x.title,
            project: pname(x.projectId),
            status: x.status,
            version: x.version,
            highRisk: x.highRisk,
            steps: x.steps.map((st) => `${st.task} [${st.risk}]`),
            signed: `${x.signed.length} of ${x.required.length}`,
            unsigned,
            path: `/dashboard/swms/${x.id}`,
          }));
        return { ok: true, text: json(rows) };
      }
      case "list_risks":
        return {
          ok: true,
          text: json(
            inProject(store.risks).map((r) => ({
              id: r.id,
              hazard: r.hazard,
              project: pname(r.projectId),
              category: r.category,
              inherent: rating(r.likelihood, r.consequence),
              residual: rating(r.resL, r.resC),
              status: r.status,
              owner: r.owner,
              review: r.review,
              reviewOverdue: daysUntil(r.review) < 0 && r.status !== "Closed",
            })),
          ),
        };
      case "list_permits":
        return {
          ok: true,
          text: json(
            inProject(store.permits).map((p) => ({
              id: p.id,
              title: p.title,
              kind: p.kind,
              project: pname(p.projectId),
              status: p.status,
              validFrom: p.from,
              validUntil: p.until,
              expiredButOpen: p.status === "Approved" && daysUntil(p.until) < 0,
              checks: `${p.checks.filter((c) => c.done).length}/${p.checks.length}`,
              issuedTo: p.issuedTo,
            })),
          ),
        };
      case "list_plant":
        return {
          ok: true,
          text: json(
            inProject(store.plant).map((p) => ({
              id: p.id,
              name: p.name,
              project: pname(p.projectId),
              status: p.status,
              defect: p.defect || null,
              nextService: p.nextService,
              serviceOverdue: daysUntil(p.nextService) < 0,
              testAndTagDue: p.tagDue,
              tagOverdue: p.tagDue ? daysUntil(p.tagDue) < 0 : false,
              prestartToday: p.lastPrestart === today,
            })),
          ),
        };
      case "list_chemicals":
        return {
          ok: true,
          text: json(
            inProject(store.chemicals).map((c) => ({
              id: c.id,
              name: c.name,
              project: pname(c.projectId),
              hazard: c.hazard,
              storedAt: c.location,
              status: c.status,
              sdsOnFile: c.hasSds,
              sdsDate: c.sdsDate,
              sdsOver5Years: c.sdsDate ? daysUntil(c.sdsDate) < -1825 : false,
            })),
          ),
        };
      case "list_inspections":
        return {
          ok: true,
          text: json(
            inProject(store.inspections).map((i) => ({
              id: i.id,
              title: i.title,
              project: pname(i.projectId),
              date: i.date,
              status: i.status,
              checked: `${i.items.filter((x) => x.result).length}/${i.items.length}`,
              failed: i.items
                .filter((x) => x.result === "fail")
                .map((x) => x.text),
              path: `/dashboard/inspections/${i.id}`,
            })),
          ),
        };
      case "list_incidents":
        return {
          ok: true,
          text: json(
            inProject(store.incidents)
              .filter((i) => !input.open_only || i.status !== "Closed")
              .map((i) => ({
                id: i.id,
                title: i.title,
                type: i.type,
                severity: i.severity,
                project: pname(i.projectId),
                date: i.date,
                status: i.status,
                notifiable:
                  i.notifiable === null
                    ? "not assessed"
                    : i.notifiable
                      ? "yes"
                      : "no",
                cause: i.cause || null,
                openActions: store.actions.filter(
                  (a) =>
                    a.source === "Incident" &&
                    a.sourceLabel === i.title &&
                    a.status === "Open",
                ).length,
                path: `/dashboard/incidents/${i.id}`,
              })),
          ),
        };
      case "list_actions":
        return {
          ok: true,
          text: json(
            inProject(store.actions)
              .filter((a) => !input.status || a.status === input.status)
              .map((a) => ({
                id: a.id,
                title: a.title,
                project: pname(a.projectId),
                owner: a.owner,
                due: a.due,
                status: a.status,
                overdue: a.status === "Open" && daysUntil(a.due) < 0,
                from: `${a.source}: ${a.sourceLabel}`,
              })),
          ),
        };
      case "list_meetings":
        return {
          ok: true,
          text: json(
            inProject(store.talks)
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 40)
              .map((t) => ({
                id: t.id,
                kind: t.kind ?? "Toolbox talk",
                topic: t.topic,
                project: pname(t.projectId),
                date: t.date,
                presenter: t.presenter,
                attended: `${t.attended.length} of ${t.expected.length}`,
              })),
          ),
        };
      case "list_defects":
        return {
          ok: true,
          text: json(
            inProject(store.defects)
              .filter((d) => !input.open_only || d.status !== "Closed")
              .map((d) => ({
                id: d.id,
                title: d.title,
                project: pname(d.projectId),
                location: d.location,
                priority: d.priority,
                assignee: d.assignee,
                due: d.due,
                overdue: d.status !== "Closed" && daysUntil(d.due) < 0,
                status: d.status,
              })),
          ),
        };
      case "list_rfis":
        return {
          ok: true,
          text: json(
            inProject(store.rfis).map((r) => ({
              id: r.id,
              number: r.number,
              subject: r.subject,
              project: pname(r.projectId),
              to: r.to,
              due: r.due,
              status: r.status,
              overdue: r.status === "Open" && daysUntil(r.due) < 0,
            })),
          ),
        };
      case "list_diary":
        return {
          ok: true,
          text: json(
            inProject(store.diaries)
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 12)
              .map((d) => ({
                id: d.id,
                date: d.date,
                project: pname(d.projectId),
                weather: d.weather,
                summary: d.summary,
                delays: d.delays || null,
                safety: d.safety || null,
                onSite: d.workers.length,
              })),
          ),
        };
      case "list_programme":
        return {
          ok: true,
          text: json(
            inProject(store.tasks)
              .sort((a, b) => a.start.localeCompare(b.start))
              .map((t) => ({
                id: t.id,
                name: t.name,
                project: pname(t.projectId),
                trade: t.trade,
                start: t.start,
                end: t.end,
                progress: `${t.progress}%`,
                needsSwms: t.needsSwms,
              })),
          ),
        };
      case "list_documents": {
        const id = s(input.project_id);
        return {
          ok: true,
          text: json(
            store.docs
              .filter((d) => !id || d.projectId === id || d.projectId === "all")
              .map((d) => ({
                id: d.id,
                title: d.title,
                category: d.category,
                appliesTo: pname(d.projectId),
                version: d.version,
                reviewDue: d.reviewDue,
                reviewOverdue: daysUntil(d.reviewDue) < 0,
                signedBy: d.signed.length,
              })),
          ),
        };
      }
      case "list_drawings":
        return {
          ok: true,
          text: json(
            inProject(store.drawings).map((d) => ({
              id: d.id,
              number: d.number,
              title: d.title,
              project: pname(d.projectId),
              currentRevision: d.revisions[0]?.rev,
            })),
          ),
        };
      case "list_notices": {
        const id = s(input.project_id);
        return {
          ok: true,
          text: json(
            store.notices
              .filter((n) => !id || n.projectId === id || n.projectId === "all")
              .map((n) => ({
                id: n.id,
                title: n.title,
                priority: n.priority,
                appliesTo: pname(n.projectId),
                date: n.date,
                readBy: n.readBy.length,
              })),
          ),
        };
      }
      case "list_visitors":
        return {
          ok: true,
          text: json(
            inProject(store.visitors)
              .sort((a, b) => b.inAt.localeCompare(a.inAt))
              .slice(0, 30)
              .map((v) => ({
                id: v.id,
                name: v.name,
                company: v.company,
                project: pname(v.projectId),
                host: v.host,
                signedIn: v.inAt,
                signedOut: v.outAt,
                inducted: v.inducted,
              })),
          ),
        };
      case "list_emergency": {
        const id = s(input.project_id);
        return {
          ok: true,
          text: json({
            projects: store.projects
              .filter((p) => !id || p.id === id)
              .map((p) => ({
                project: p.name,
                assemblyPoint: p.assembly || null,
                hospital: p.hospital || null,
                contact: p.emergencyContact || null,
                wardens: p.wardens || null,
              })),
            drills: store.drills
              .filter((d) => !id || d.projectId === id)
              .map((d) => ({
                kind: d.kind,
                project: pname(d.projectId),
                held: d.date,
                nextDue: d.nextDue,
                overdue: daysUntil(d.nextDue) < 0,
              })),
          }),
        };
      }
      case "safety_stats": {
        const id = s(input.project_id);
        const projects = store.projects.filter((p) => !id || p.id === id);
        const inc = store.incidents.filter((i) => !id || i.projectId === id);
        const hours = projects.reduce((n, p) => n + p.hours, 0);
        const lti = inc.filter((i) => i.lostTime).length;
        const recordable = inc.filter(
          (i) => i.type === "Injury" || i.lostTime,
        ).length;
        const items = store.inspections
          .filter((i) => !id || i.projectId === id)
          .flatMap((i) => i.items);
        const pass = items.filter((x) => x.result === "pass").length;
        const failed = items.filter((x) => x.result === "fail").length;
        const acts = store.actions.filter((a) => !id || a.projectId === id);
        const active = store.swms.filter(
          (x) => x.status === "Active" && (!id || x.projectId === id),
        );
        const need = active.reduce((n, x) => n + x.required.length, 0);
        const got = active.reduce(
          (n, x) => n + x.required.filter((w) => x.signed.includes(w)).length,
          0,
        );
        const workers = store.workers.filter(
          (w) => !id || w.projects.includes(id),
        );
        const okWorkers = workers.filter(
          (w) => !w.tickets.some((t) => expiryOf(t.expires, 0) === "expired"),
        ).length;
        const pct = (a: number, b: number) =>
          b ? `${Math.round((a / b) * 100)}%` : "n/a";
        return {
          ok: true,
          text: json({
            scope: id ? pname(id) : "all projects",
            hoursWorked: hours,
            lostTimeInjuries: lti,
            recordableInjuries: recordable,
            LTIFR: hours ? +((lti * 1_000_000) / hours).toFixed(1) : "n/a",
            TRIFR: hours
              ? +((recordable * 1_000_000) / hours).toFixed(1)
              : "n/a",
            nearMissAndHazardReports: inc.filter(
              (i) => i.type === "Near miss" || i.type === "Hazard",
            ).length,
            openIncidents: inc.filter((i) => i.status !== "Closed").length,
            inspectionPassRate: pct(pass, pass + failed),
            actionsClosed: pct(
              acts.filter((a) => a.status === "Done").length,
              acts.length,
            ),
            overdueActions: acts.filter(
              (a) => a.status === "Open" && daysUntil(a.due) < 0,
            ).length,
            swmsSigned: pct(got, need),
            workersWithValidTickets: pct(okWorkers, workers.length),
          }),
        };
      }
      case "list_audit": {
        const id = s(input.project_id);
        return {
          ok: true,
          text: json(
            store.audit
              .filter((e) => !id || e.projectId === id || e.projectId === "all")
              .slice(0, 25)
              .map((e) => ({
                when: `${e.day} ${e.t}`,
                who: e.name,
                what: e.act,
                from: e.from,
                to: e.to,
                area: e.area,
              })),
          ),
        };
      }
      case "open_page": {
        const path = s(input.path);
        if (!/^\/dashboard(\/[a-z0-9._~-]+)*\/?$/i.test(path))
          return fail(
            "The path must be a WHSCOMPLY page starting with /dashboard/.",
          );
        return {
          ok: true,
          text: `Link shown to the user: ${path}`,
          outcome: s(input.label),
          link: { path, label: s(input.label) || "Open" },
        };
      }

      /* ---------- changes ---------- */
      case "create_action": {
        const projectId = pidIn(store, input);
        if (!projectId) return fail(BAD_PROJECT);
        const title = s(input.title);
        const owner = s(input.owner);
        const due = s(input.due);
        if (!title || !owner)
          return fail("An action needs a title and an owner.");
        if (!isDate(due)) return fail("Due must be yyyy-mm-dd.");
        store.addAction({
          projectId,
          title,
          source: "Manual",
          sourceLabel: s(input.source_label) || "Raised by the Assistant",
          owner,
          due,
        });
        return {
          ok: true,
          text: `Action raised for ${owner}: ${title}, due ${due}.`,
          outcome: `Action raised for ${owner}`,
          link: { path: "/dashboard/actions", label: "Open actions" },
        };
      }
      case "set_action_status": {
        const a = store.actions.find((x) => x.id === s(input.action_id));
        if (!a) return fail("No action with that id. Call list_actions.");
        const status = oneOf(input.status, ["Open", "Done"] as const);
        if (!status) return fail("Status must be Open or Done.");
        if (a.status !== status) store.toggleAction(a.id);
        return {
          ok: true,
          text: `Action "${a.title}" is now ${status}.`,
          outcome: `Marked ${status}`,
          link: { path: "/dashboard/actions", label: "Open actions" },
        };
      }
      case "report_incident": {
        const projectId = pidIn(store, input);
        if (!projectId) return fail(BAD_PROJECT);
        const type = oneOf(input.type, [
          "Near miss",
          "Hazard",
          "First aid",
          "Injury",
          "Property damage",
          "Dangerous incident",
        ] as const);
        const severity = oneOf(input.severity, [
          "Low",
          "Medium",
          "High",
          "Extreme",
        ] as const);
        const title = s(input.title);
        const description = s(input.description);
        const location = s(input.location);
        if (!type || !severity)
          return fail("Type or severity is not one of the allowed values.");
        if (!title || !description || !location)
          return fail(
            "An incident needs a title, a location and a description.",
          );
        const date = s(input.date) || today;
        if (!isDate(date)) return fail("Date must be yyyy-mm-dd.");
        const time = s(input.time) || new Date().toTimeString().slice(0, 5);
        if (!isTime(time)) return fail("Time must be 24 hour, like 10:30.");
        const id = store.reportIncident({
          projectId,
          type: type as IncidentType,
          title,
          date,
          time,
          location,
          reporter: `${me.name} (via the Assistant)`,
          people: s(input.people),
          description,
          severity: severity as RiskLevel,
        });
        return {
          ok: true,
          text: `Incident reported (${id}) as ${type}. Notifiability is not assessed: a person must do that and progress it.`,
          outcome: `Reported: ${title}`,
          link: {
            path: `/dashboard/incidents/${id}`,
            label: "Open the incident",
          },
        };
      }
      case "add_risk": {
        const projectId = pidIn(store, input);
        if (!projectId) return fail(BAD_PROJECT);
        const hazard = s(input.hazard);
        const category = RISK_CATEGORIES.find(
          (c) => norm(c) === norm(s(input.category)),
        );
        const l = num(input.likelihood, 1, 5);
        const c = num(input.consequence, 1, 5);
        if (
          !hazard ||
          !category ||
          l === null ||
          c === null ||
          !s(input.controls) ||
          !s(input.owner)
        )
          return fail(
            "A risk needs a hazard, category, likelihood and consequence (1 to 5), controls and an owner.",
          );
        const rl = num(input.residual_likelihood, 1, 5) ?? Math.max(1, l - 1);
        const rc = num(input.residual_consequence, 1, 5) ?? c;
        const review = s(input.review) || addDays(30);
        if (!isDate(review)) return fail("Review must be yyyy-mm-dd.");
        store.addRisk({
          projectId,
          hazard,
          category,
          likelihood: l,
          consequence: c,
          controls: s(input.controls),
          resL: Math.min(rl, l),
          resC: Math.min(rc, c),
          owner: s(input.owner),
          review,
          status: "Open",
        });
        return {
          ok: true,
          text: `Risk added: ${hazard} (${rating(l, c)} before controls).`,
          outcome: "Added to the risk register",
          link: { path: "/dashboard/risks", label: "Open the risk register" },
        };
      }
      case "schedule_talk": {
        const projectId = pidIn(store, input);
        if (!projectId) return fail(BAD_PROJECT);
        const topic = s(input.topic);
        const date = s(input.date);
        if (!topic || !isDate(date))
          return fail("A topic and a yyyy-mm-dd date are needed.");
        const kind = (oneOf(input.kind, [
          "Toolbox talk",
          "Pre-start meeting",
          "WHS committee",
          "Coordination meeting",
        ] as const) ?? "Toolbox talk") as MeetingKind;
        store.addTalk({
          projectId,
          kind,
          topic,
          date,
          presenter:
            s(input.presenter) ||
            store.projects.find((p) => p.id === projectId)?.manager ||
            "Site manager",
          notes: s(input.notes),
        });
        return {
          ok: true,
          text: `${kind} scheduled: ${topic} on ${date}.`,
          outcome: `${kind} scheduled`,
          link: {
            path:
              kind === "Toolbox talk"
                ? "/dashboard/toolbox"
                : "/dashboard/consultation",
            label: "Open it",
          },
        };
      }
      case "log_defect": {
        const projectId = pidIn(store, input);
        if (!projectId) return fail(BAD_PROJECT);
        const priority = oneOf(input.priority, [
          "Low",
          "Medium",
          "High",
          "Critical",
        ] as const);
        const due = s(input.due);
        if (!priority || !isDate(due))
          return fail("Priority or due date is not valid.");
        if (
          !s(input.title) ||
          !s(input.description) ||
          !s(input.location) ||
          !s(input.assignee)
        )
          return fail(
            "A defect needs a title, description, location and assignee.",
          );
        store.add(
          "defects",
          {
            projectId,
            title: s(input.title),
            description: s(input.description),
            location: s(input.location),
            priority,
            assignee: s(input.assignee),
            due,
            raised: today,
            raisedBy: `${me.name} (via the Assistant)`,
            status: "Open",
            files: [],
          },
          {
            area: "Defects",
            projectId,
            act: `logged the defect ${s(input.title)}`,
            to: "Open",
          },
        );
        return {
          ok: true,
          text: `Defect logged: ${s(input.title)}.`,
          outcome: "Defect logged",
          link: { path: "/dashboard/defects", label: "Open defects" },
        };
      }
      case "set_defect_status": {
        const d = store.defects.find((x) => x.id === s(input.defect_id));
        if (!d) return fail("No defect with that id. Call list_defects.");
        const status = oneOf(input.status, [
          "Open",
          "In progress",
          "Ready to inspect",
          "Closed",
        ] as const);
        if (!status) return fail("Status is not one of the allowed values.");
        store.patch(
          "defects",
          d.id,
          { status },
          {
            area: "Defects",
            projectId: d.projectId,
            act: `moved the defect ${d.title} to ${status}`,
            from: d.status,
            to: status,
          },
        );
        return {
          ok: true,
          text: `Defect "${d.title}" is now ${status}.`,
          outcome: `Moved to ${status}`,
          link: { path: "/dashboard/defects", label: "Open defects" },
        };
      }
      case "raise_rfi": {
        const projectId = pidIn(store, input);
        if (!projectId) return fail(BAD_PROJECT);
        const due = s(input.due);
        if (
          !s(input.subject) ||
          !s(input.question) ||
          !s(input.to) ||
          !isDate(due)
        )
          return fail(
            "An RFI needs a subject, question, who it is to and a yyyy-mm-dd due date.",
          );
        const n =
          store.rfis.filter((r) => r.projectId === projectId).length + 11;
        const number = `RFI-${String(n).padStart(3, "0")}`;
        store.add(
          "rfis",
          {
            projectId,
            number,
            subject: s(input.subject),
            question: s(input.question),
            raisedBy: `${me.name} (via the Assistant)`,
            to: s(input.to),
            due,
            status: "Open",
            answer: "",
          },
          {
            area: "RFIs",
            projectId,
            act: `raised an RFI: ${s(input.subject)}`,
            to: "Open",
          },
        );
        return {
          ok: true,
          text: `${number} raised: ${s(input.subject)}.`,
          outcome: `${number} raised`,
          link: { path: "/dashboard/rfis", label: "Open RFIs" },
        };
      }
      case "add_diary_entry": {
        const projectId = pidIn(store, input);
        if (!projectId) return fail(BAD_PROJECT);
        const date = s(input.date) || today;
        if (!isDate(date)) return fail("Date must be yyyy-mm-dd.");
        if (!s(input.summary) || !s(input.work_done))
          return fail("A diary entry needs a summary and the work done.");
        const weather = (oneOf(input.weather, WEATHER) ?? "Fine") as Weather;
        store.add(
          "diaries",
          {
            projectId,
            date,
            weather,
            temp: null,
            summary: s(input.summary),
            workDone: s(input.work_done),
            delays: s(input.delays),
            safety: s(input.safety_notes),
            workers:
              store.projects.find((p) => p.id === projectId)?.onSite ?? [],
            author: `${me.name} (via the Assistant)`,
            files: [],
          },
          {
            area: "Diary",
            projectId,
            act: `wrote the site diary for ${fmtDate(date)}`,
            to: "Recorded",
          },
        );
        return {
          ok: true,
          text: "Diary entry saved.",
          outcome: "Diary entry saved",
          link: { path: "/dashboard/diary", label: "Open the diary" },
        };
      }
      case "post_notice": {
        const id = s(input.project_id);
        if (id !== "all" && !store.projects.some((p) => p.id === id))
          return fail(`${BAD_PROJECT} Or use "all".`);
        const priority = oneOf(input.priority, [
          "Info",
          "Important",
          "Safety alert",
        ] as const);
        if (!priority || !s(input.title) || !s(input.body))
          return fail("A notice needs a title, a message and a priority.");
        store.add(
          "notices",
          {
            projectId: id,
            title: s(input.title),
            body: s(input.body),
            priority,
            author: `${me.name} (via the Assistant)`,
            date: today,
            pinned: priority === "Safety alert",
            readBy: [],
          },
          {
            area: "Notices",
            projectId: id,
            act: `posted the notice ${s(input.title)}`,
            to: priority,
          },
        );
        return {
          ok: true,
          text: `Notice posted: ${s(input.title)}.`,
          outcome: "Notice posted",
          link: { path: "/dashboard/notices", label: "Open notices" },
        };
      }
      case "sign_on_worker":
      case "sign_off_worker": {
        const projectId = pidIn(store, input);
        if (!projectId) return fail(BAD_PROJECT);
        const w = store.workers.find((x) => x.id === s(input.worker_id));
        if (!w) return fail("No worker with that id. Call list_workers.");
        if (name === "sign_off_worker") {
          store.signOff(projectId, w.id);
          return {
            ok: true,
            text: `${w.name} signed off at ${pname(projectId)}.`,
            outcome: `${w.name} signed off`,
            link: { path: "/dashboard/projects", label: "Open the gate list" },
          };
        }
        if (!w.projects.includes(projectId))
          return fail(`${w.name} is not assigned to ${pname(projectId)}.`);
        if (!w.inducted.includes(projectId))
          return fail(
            `${w.name} has not been inducted to ${pname(projectId)}. A person has to complete the induction at /dashboard/inductions.`,
          );
        const lapsed = w.tickets.find(
          (t) => expiryOf(t.expires, 0) === "expired",
        );
        if (lapsed)
          return fail(
            `${w.name}'s ${lapsed.kind} has expired, so they cannot be signed on.`,
          );
        store.signOn(projectId, w.id);
        return {
          ok: true,
          text: `${w.name} signed on at ${pname(projectId)}.`,
          outcome: `${w.name} signed on`,
          link: { path: "/dashboard/projects", label: "Open the gate list" },
        };
      }
      case "add_programme_task": {
        const projectId = pidIn(store, input);
        if (!projectId) return fail(BAD_PROJECT);
        const start = s(input.start);
        const end = s(input.end);
        if (!s(input.name) || !s(input.trade) || !isDate(start) || !isDate(end))
          return fail(
            "A task needs a name, trade and yyyy-mm-dd start and finish dates.",
          );
        if (end < start)
          return fail("The finish date is before the start date.");
        store.add(
          "tasks",
          {
            projectId,
            name: s(input.name),
            trade: s(input.trade),
            start,
            end,
            progress: 0,
            needsSwms: input.needs_swms === true,
          },
          {
            area: "Programme",
            projectId,
            act: `added the task ${s(input.name)}`,
            to: `${fmtDate(start)} to ${fmtDate(end)}`,
          },
        );
        return {
          ok: true,
          text: `Task added: ${s(input.name)}.`,
          outcome: "Added to the programme",
          link: { path: "/dashboard/programme", label: "Open the programme" },
        };
      }
      case "sign_in_visitor": {
        const projectId = pidIn(store, input);
        if (!projectId) return fail(BAD_PROJECT);
        if (
          !s(input.name) ||
          !s(input.company) ||
          !s(input.purpose) ||
          !s(input.host)
        )
          return fail("A visitor needs a name, company, purpose and host.");
        store.signInVisitor({
          projectId,
          name: s(input.name),
          company: s(input.company),
          purpose: s(input.purpose),
          host: s(input.host),
          inducted: input.inducted === true,
        });
        return {
          ok: true,
          text: `${s(input.name)} signed in at ${pname(projectId)}${input.inducted === true ? "" : ", and needs an escort because they have not been inducted"}.`,
          outcome: `${s(input.name)} signed in`,
          link: { path: "/dashboard/visitors", label: "Open visitors" },
        };
      }
      case "request_permit": {
        const projectId = pidIn(store, input);
        if (!projectId) return fail(BAD_PROJECT);
        const kind = (Object.keys(PERMIT_CHECKS) as PermitKind[]).find(
          (k) => norm(k) === norm(s(input.kind)),
        );
        const from = s(input.from);
        const until = s(input.until);
        if (!kind)
          return fail("That permit type is not one of the allowed values.");
        if (
          !s(input.title) ||
          !s(input.location) ||
          !s(input.issued_to) ||
          !isDate(from) ||
          !isDate(until)
        )
          return fail(
            "A permit needs the work, location, who it is issued to and yyyy-mm-dd dates.",
          );
        if (until < from)
          return fail("The valid-until date is before the start.");
        const id = store.addPermit({
          projectId,
          kind,
          title: s(input.title),
          location: s(input.location),
          requestedBy: `${me.name} (via the Assistant)`,
          issuedTo: s(input.issued_to),
          from,
          until,
        });
        return {
          ok: true,
          text: `Permit requested (${id}). Its ${PERMIT_CHECKS[kind].length} safety checks are unticked: a person must tick them on site and approve it. Do not tell the user the work may start.`,
          outcome: `${kind} permit requested`,
          link: { path: "/dashboard/permits", label: "Open permits" },
        };
      }
      case "start_inspection": {
        const projectId = pidIn(store, input);
        if (!projectId) return fail(BAD_PROJECT);
        const names = [
          ...Object.keys(INSPECTION_TEMPLATES),
          ...store.customTemplates.map((t) => t.name),
        ];
        const kind = names.find((n) => norm(n) === norm(s(input.kind)));
        if (!kind)
          return fail(`The checklist must be one of: ${names.join(", ")}.`);
        if (!s(input.inspector)) return fail("An inspector is needed.");
        const id = store.startInspection(projectId, kind, s(input.inspector));
        return {
          ok: true,
          text: `${kind} started (${id}), blank. Results must be recorded by a person on site.`,
          outcome: `${kind} started`,
          link: {
            path: `/dashboard/inspections/${id}`,
            label: "Open the inspection",
          },
        };
      }
    }
  } catch (e) {
    return fail(
      `That failed: ${e instanceof Error ? e.message : "unknown error"}.`,
    );
  }
  return fail(`Unknown tool ${name}.`);
}
