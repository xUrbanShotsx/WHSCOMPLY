"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  INCIDENT_FLOW,
  INSPECTION_TEMPLATES,
  initialsOf,
  me,
  seedActions,
  seedAudit,
  seedIncidents,
  seedInspections,
  seedMembers,
  seedProjects,
  seedRisks,
  seedSettings,
  seedSubcontractors,
  seedSwms,
  seedTalks,
  seedWorkers,
  type Action,
  type AuditArea,
  type AuditEvent,
  type Incident,
  type IncidentStatus,
  type Inspection,
  type InspResult,
  type Member,
  type Project,
  type Risk,
  type Settings,
  type SubDoc,
  type Subcontractor,
  type Swms,
  type SwmsStep,
  type Talk,
  type Ticket,
  type Worker,
} from "@/lib/data";
import { todayISO } from "@/lib/format";

const KEY = "whscomply-demo-v2";

export const ALL = "all";

type Saved = {
  /** the project picked in the top bar, or "all" */
  projectId: string;
  projects: Project[];
  workers: Worker[];
  subs: Subcontractor[];
  swms: Swms[];
  risks: Risk[];
  talks: Talk[];
  inspections: Inspection[];
  incidents: Incident[];
  actions: Action[];
  audit: AuditEvent[];
  members: Member[];
  settings: Settings;
};

const SEED: Saved = {
  projectId: ALL,
  projects: seedProjects,
  workers: seedWorkers,
  subs: seedSubcontractors,
  swms: seedSwms,
  risks: seedRisks,
  talks: seedTalks,
  inspections: seedInspections,
  incidents: seedIncidents,
  actions: seedActions,
  audit: seedAudit,
  members: seedMembers,
  settings: seedSettings,
};

/* ---- a tiny external store over localStorage, so state survives navigation and reloads ---- */

const listeners = new Set<() => void>();
let cacheRaw: string | null | undefined;
let cacheVal: Saved | null = null;

function valid(p: Saved | null): p is Saved {
  return (
    !!p &&
    typeof p.projectId === "string" &&
    Array.isArray(p.projects) &&
    Array.isArray(p.workers) &&
    Array.isArray(p.subs) &&
    Array.isArray(p.swms) &&
    Array.isArray(p.risks) &&
    Array.isArray(p.talks) &&
    Array.isArray(p.inspections) &&
    Array.isArray(p.incidents) &&
    Array.isArray(p.actions) &&
    Array.isArray(p.audit) &&
    Array.isArray(p.members) &&
    !!p.settings
  );
}

function readSaved(): Saved | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    // blocked storage: stay on the in-memory copy
    return cacheVal;
  }
  if (raw === cacheRaw) return cacheVal;
  cacheRaw = raw;
  try {
    const p = raw ? (JSON.parse(raw) as Saved) : null;
    cacheVal = valid(p) ? p : null;
  } catch {
    cacheVal = null;
  }
  return cacheVal;
}

function writeSaved(next: Saved) {
  cacheVal = next;
  try {
    const raw = JSON.stringify(next);
    localStorage.setItem(KEY, raw);
    cacheRaw = raw;
  } catch {
    // storage full or blocked: the demo still works for this visit
    cacheRaw = undefined;
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

const current = (): Saved => readSaved() ?? cacheVal ?? SEED;
const update = (fn: (s: Saved) => Saved) => writeSaved(fn(current()));

const uid = () =>
  Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);

const nowTime = () =>
  new Date().toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

function ev(
  area: AuditArea,
  projectId: string,
  act: string,
  from: string,
  to: string,
): AuditEvent {
  return {
    id: uid(),
    day: "Today",
    t: nowTime(),
    who: me.initials,
    name: me.name,
    act,
    from,
    to,
    area,
    projectId,
  };
}

/** Apply a change and append one audit entry, in a single write. */
const act = (fn: (s: Saved) => Saved, e: AuditEvent) =>
  update((s) => {
    const n = fn(s);
    return { ...n, audit: [e, ...n.audit] };
  });

const workerName = (s: Saved, id: string) =>
  s.workers.find((w) => w.id === id)?.name ?? "A worker";
const projectName = (s: Saved, id: string) =>
  s.projects.find((p) => p.id === id)?.name ?? "a project";

/* ---- inputs ---- */

export type NewProject = Pick<
  Project,
  "name" | "address" | "client" | "stage" | "manager" | "status"
>;
export type NewWorker = Pick<Worker, "name" | "role" | "company" | "phone"> & {
  projects: string[];
};
export type NewSub = Pick<
  Subcontractor,
  "name" | "trade" | "contact" | "phone"
> & { projects: string[] };
export type NewSwms = {
  title: string;
  projectId: string;
  highRisk: boolean;
  owner: string;
  steps: Omit<SwmsStep, "id">[];
};
export type NewRisk = Omit<Risk, "id">;
export type NewTalk = Pick<
  Talk,
  "projectId" | "topic" | "date" | "presenter" | "notes"
>;
export type NewIncident = Omit<
  Incident,
  "id" | "status" | "notifiable" | "cause"
>;
export type NewAction = Omit<Action, "id" | "status">;

type Store = Saved & {
  ready: boolean;
  setProject: (id: string) => void;

  addProject: (i: NewProject) => string;
  updateProject: (id: string, patch: Partial<Project>) => void;
  signOn: (projectId: string, workerId: string) => void;
  signOff: (projectId: string, workerId: string) => void;

  addWorker: (i: NewWorker) => string;
  updateWorker: (id: string, patch: Partial<Worker>) => void;
  removeWorker: (id: string) => void;
  addTicket: (wid: string, t: Omit<Ticket, "id">) => void;
  removeTicket: (wid: string, tid: string) => void;
  induct: (wid: string, projectId: string) => void;

  addSub: (i: NewSub) => string;
  setApproved: (id: string, approved: boolean) => void;
  addDoc: (sid: string, d: Omit<SubDoc, "id">) => void;
  removeDoc: (sid: string, did: string) => void;

  addSwms: (i: NewSwms) => string;
  updateSwms: (id: string, patch: Partial<Swms>) => void;
  addStep: (id: string, step: Omit<SwmsStep, "id">) => void;
  removeStep: (id: string, stepId: string) => void;
  signSwms: (id: string, workerId: string) => void;
  newVersion: (id: string) => string;

  addRisk: (i: NewRisk) => void;
  updateRisk: (id: string, patch: Partial<Risk>) => void;
  removeRisk: (id: string) => void;

  addTalk: (i: NewTalk) => string;
  toggleAttendance: (id: string, workerId: string) => void;
  updateTalk: (id: string, patch: Partial<Talk>) => void;
  removeTalk: (id: string) => void;

  startInspection: (
    projectId: string,
    kind: string,
    inspector: string,
  ) => string;
  setResult: (
    id: string,
    itemId: string,
    result: InspResult,
    note?: string,
  ) => void;
  completeInspection: (id: string) => void;

  reportIncident: (i: NewIncident) => string;
  updateIncident: (id: string, patch: Partial<Incident>) => void;
  advanceIncident: (id: string, to: IncidentStatus) => void;

  addAction: (i: NewAction) => void;
  toggleAction: (id: string) => void;
  removeAction: (id: string) => void;

  inviteMember: (m: Pick<Member, "name" | "email" | "role">) => void;
  updateMember: (id: string, patch: Partial<Member>) => void;
  removeMember: (id: string) => void;
  updateCompany: (patch: Partial<Settings["company"]>) => void;
  setNotify: (patch: Partial<Settings["notify"]>) => void;
  setWarnDays: (n: number) => void;
  resetDemo: () => void;
};

const patchIn = <T extends { id: string }>(
  list: T[],
  id: string,
  fn: (t: T) => T,
) => list.map((t) => (t.id === id ? fn(t) : t));

const actions: Omit<Store, keyof Saved | "ready"> = {
  setProject: (id) => update((s) => ({ ...s, projectId: id })),

  addProject: (i) => {
    const id = `p-${uid()}`;
    act(
      (s) => ({
        ...s,
        projects: [...s.projects, { ...i, id, start: todayISO(), onSite: [] }],
      }),
      ev(
        "Projects",
        id,
        `created the project ${i.name}`,
        "No project",
        i.status,
      ),
    );
    return id;
  },
  updateProject: (id, patch) =>
    act(
      (s) => ({
        ...s,
        projects: patchIn(s.projects, id, (p) => ({ ...p, ...patch })),
      }),
      ev("Projects", id, "updated the project details", "Previous", "Updated"),
    ),
  signOn: (projectId, workerId) => {
    const s0 = current();
    act(
      (s) => ({
        ...s,
        projects: patchIn(s.projects, projectId, (p) =>
          p.onSite.includes(workerId)
            ? p
            : { ...p, onSite: [...p.onSite, workerId] },
        ),
      }),
      ev(
        "People",
        projectId,
        `signed ${workerName(s0, workerId)} on at ${projectName(s0, projectId)}`,
        "Off site",
        "On site",
      ),
    );
  },
  signOff: (projectId, workerId) => {
    const s0 = current();
    act(
      (s) => ({
        ...s,
        projects: patchIn(s.projects, projectId, (p) => ({
          ...p,
          onSite: p.onSite.filter((w) => w !== workerId),
        })),
      }),
      ev(
        "People",
        projectId,
        `signed ${workerName(s0, workerId)} off at ${projectName(s0, projectId)}`,
        "On site",
        "Off site",
      ),
    );
  },

  addWorker: (i) => {
    const id = `w-${uid()}`;
    act(
      (s) => ({
        ...s,
        workers: [...s.workers, { ...i, id, tickets: [], inducted: [] }],
      }),
      ev(
        "People",
        i.projects[0] ?? ALL,
        `added ${i.name} to the workforce`,
        "No record",
        "Added",
      ),
    );
    return id;
  },
  updateWorker: (id, patch) =>
    update((s) => ({
      ...s,
      workers: patchIn(s.workers, id, (w) => ({ ...w, ...patch })),
    })),
  removeWorker: (id) => {
    const s0 = current();
    act(
      (s) => ({
        ...s,
        workers: s.workers.filter((w) => w.id !== id),
        projects: s.projects.map((p) => ({
          ...p,
          onSite: p.onSite.filter((w) => w !== id),
        })),
      }),
      ev("People", ALL, `removed ${workerName(s0, id)}`, "Active", "Removed"),
    );
  },
  addTicket: (wid, t) => {
    const s0 = current();
    act(
      (s) => ({
        ...s,
        workers: patchIn(s.workers, wid, (w) => ({
          ...w,
          tickets: [...w.tickets, { ...t, id: uid() }],
        })),
      }),
      ev(
        "People",
        ALL,
        `recorded ${t.kind} for ${workerName(s0, wid)}`,
        "No ticket",
        t.expires ?? "No expiry",
      ),
    );
  },
  removeTicket: (wid, tid) =>
    update((s) => ({
      ...s,
      workers: patchIn(s.workers, wid, (w) => ({
        ...w,
        tickets: w.tickets.filter((t) => t.id !== tid),
      })),
    })),
  induct: (wid, projectId) => {
    const s0 = current();
    act(
      (s) => ({
        ...s,
        workers: patchIn(s.workers, wid, (w) =>
          w.inducted.includes(projectId)
            ? w
            : { ...w, inducted: [...w.inducted, projectId] },
        ),
      }),
      ev(
        "People",
        projectId,
        `recorded the ${projectName(s0, projectId)} induction for ${workerName(s0, wid)}`,
        "Not inducted",
        "Inducted",
      ),
    );
  },

  addSub: (i) => {
    const id = `s-${uid()}`;
    act(
      (s) => ({
        ...s,
        subs: [...s.subs, { ...i, id, approved: false, docs: [] }],
      }),
      ev(
        "People",
        i.projects[0] ?? ALL,
        `added the subcontractor ${i.name}`,
        "No record",
        "Pending",
      ),
    );
    return id;
  },
  setApproved: (id, approved) => {
    const name =
      current().subs.find((x) => x.id === id)?.name ?? "A subcontractor";
    act(
      (s) => ({ ...s, subs: patchIn(s.subs, id, (x) => ({ ...x, approved })) }),
      ev(
        "People",
        ALL,
        `${approved ? "approved" : "withdrew approval for"} ${name}`,
        approved ? "Pending" : "Approved",
        approved ? "Approved" : "Pending",
      ),
    );
  },
  addDoc: (sid, d) =>
    update((s) => ({
      ...s,
      subs: patchIn(s.subs, sid, (x) => ({
        ...x,
        docs: [...x.docs, { ...d, id: uid() }],
      })),
    })),
  removeDoc: (sid, did) =>
    update((s) => ({
      ...s,
      subs: patchIn(s.subs, sid, (x) => ({
        ...x,
        docs: x.docs.filter((d) => d.id !== did),
      })),
    })),

  addSwms: (i) => {
    const id = `sw-${uid()}`;
    const s0 = current();
    const required = s0.workers
      .filter((w) => w.projects.includes(i.projectId))
      .map((w) => w.id);
    act(
      (s) => ({
        ...s,
        swms: [
          {
            id,
            title: i.title,
            projectId: i.projectId,
            version: 1,
            status: "Draft",
            highRisk: i.highRisk,
            owner: i.owner,
            updated: todayISO(),
            required,
            signed: [],
            steps: i.steps.map((st) => ({ ...st, id: uid() })),
          },
          ...s.swms,
        ],
      }),
      ev(
        "SWMS",
        i.projectId,
        `created the SWMS ${i.title}`,
        "No SWMS",
        "Draft v1",
      ),
    );
    return id;
  },
  updateSwms: (id, patch) => {
    const sw = current().swms.find((x) => x.id === id);
    act(
      (s) => ({
        ...s,
        swms: patchIn(s.swms, id, (x) => ({
          ...x,
          ...patch,
          updated: todayISO(),
        })),
      }),
      ev(
        "SWMS",
        sw?.projectId ?? ALL,
        `updated ${sw?.title ?? "a SWMS"}`,
        patch.status ? (sw?.status ?? "") : "Previous",
        patch.status ?? "Updated",
      ),
    );
  },
  addStep: (id, step) =>
    update((s) => ({
      ...s,
      swms: patchIn(s.swms, id, (x) => ({
        ...x,
        steps: [...x.steps, { ...step, id: uid() }],
        // a changed method means the crew must sign again
        signed: [],
        updated: todayISO(),
      })),
    })),
  removeStep: (id, stepId) =>
    update((s) => ({
      ...s,
      swms: patchIn(s.swms, id, (x) => ({
        ...x,
        steps: x.steps.filter((st) => st.id !== stepId),
        signed: [],
        updated: todayISO(),
      })),
    })),
  signSwms: (id, workerId) => {
    const s0 = current();
    const sw = s0.swms.find((x) => x.id === id);
    act(
      (s) => ({
        ...s,
        swms: patchIn(s.swms, id, (x) =>
          x.signed.includes(workerId)
            ? x
            : {
                ...x,
                signed: [...x.signed, workerId],
                required: x.required.includes(workerId)
                  ? x.required
                  : [...x.required, workerId],
              },
        ),
      }),
      ev(
        "SWMS",
        sw?.projectId ?? ALL,
        `signed ${sw?.title ?? "the SWMS"} for ${workerName(s0, workerId)}`,
        "Unsigned",
        `Signed v${sw?.version ?? 1}`,
      ),
    );
  },
  newVersion: (id) => {
    const nid = `sw-${uid()}`;
    const sw = current().swms.find((x) => x.id === id);
    if (!sw) return id;
    act(
      (s) => ({
        ...s,
        swms: [
          {
            ...sw,
            id: nid,
            version: sw.version + 1,
            status: "Draft",
            signed: [],
            updated: todayISO(),
          },
          ...patchIn(s.swms, id, (x) => ({
            ...x,
            status: "Superseded" as const,
          })),
        ],
      }),
      ev(
        "SWMS",
        sw.projectId,
        `started version ${sw.version + 1} of ${sw.title}`,
        `v${sw.version}`,
        `v${sw.version + 1} draft`,
      ),
    );
    return nid;
  },

  addRisk: (i) =>
    act(
      (s) => ({ ...s, risks: [{ ...i, id: `r-${uid()}` }, ...s.risks] }),
      ev(
        "Risks",
        i.projectId,
        `added the risk ${i.hazard}`,
        "Not on register",
        "Open",
      ),
    ),
  updateRisk: (id, patch) => {
    const r = current().risks.find((x) => x.id === id);
    act(
      (s) => ({
        ...s,
        risks: patchIn(s.risks, id, (x) => ({ ...x, ...patch })),
      }),
      ev(
        "Risks",
        r?.projectId ?? ALL,
        `updated the risk ${r?.hazard ?? ""}`.trim(),
        patch.status ? (r?.status ?? "") : "Previous",
        patch.status ?? "Updated",
      ),
    );
  },
  removeRisk: (id) => {
    const r = current().risks.find((x) => x.id === id);
    act(
      (s) => ({ ...s, risks: s.risks.filter((x) => x.id !== id) }),
      ev(
        "Risks",
        r?.projectId ?? ALL,
        `removed the risk ${r?.hazard ?? ""}`.trim(),
        "On register",
        "Removed",
      ),
    );
  },

  addTalk: (i) => {
    const id = `tb-${uid()}`;
    const expected = current()
      .workers.filter((w) => w.projects.includes(i.projectId))
      .map((w) => w.id);
    act(
      (s) => ({
        ...s,
        talks: [{ ...i, id, expected, attended: [] }, ...s.talks],
      }),
      ev(
        "Toolbox",
        i.projectId,
        `scheduled the toolbox talk ${i.topic}`,
        "Not scheduled",
        i.date,
      ),
    );
    return id;
  },
  toggleAttendance: (id, workerId) => {
    const s0 = current();
    const t = s0.talks.find((x) => x.id === id);
    const was = t?.attended.includes(workerId) ?? false;
    act(
      (s) => ({
        ...s,
        talks: patchIn(s.talks, id, (x) => ({
          ...x,
          attended: was
            ? x.attended.filter((w) => w !== workerId)
            : [...x.attended, workerId],
        })),
      }),
      ev(
        "Toolbox",
        t?.projectId ?? ALL,
        `${was ? "removed" : "recorded"} ${workerName(s0, workerId)} ${was ? "from" : "at"} ${t?.topic ?? "the talk"}`,
        was ? "Attended" : "Absent",
        was ? "Absent" : "Attended",
      ),
    );
  },
  updateTalk: (id, patch) =>
    update((s) => ({
      ...s,
      talks: patchIn(s.talks, id, (x) => ({ ...x, ...patch })),
    })),
  removeTalk: (id) =>
    update((s) => ({ ...s, talks: s.talks.filter((x) => x.id !== id) })),

  startInspection: (projectId, kind, inspector) => {
    const id = `in-${uid()}`;
    const items = (INSPECTION_TEMPLATES[kind] ?? []).map((text, i) => ({
      id: `i${i}`,
      text,
      result: null as InspResult,
      note: "",
    }));
    act(
      (s) => ({
        ...s,
        inspections: [
          {
            id,
            projectId,
            title: kind,
            kind,
            date: todayISO(),
            inspector,
            items,
            status: "In progress",
          },
          ...s.inspections,
        ],
      }),
      ev(
        "Inspections",
        projectId,
        `started a ${kind.toLowerCase()}`,
        "Not started",
        "In progress",
      ),
    );
    return id;
  },
  setResult: (id, itemId, result, note) => {
    const insp = current().inspections.find((x) => x.id === id);
    const item = insp?.items.find((i) => i.id === itemId);
    update((s) => {
      let next: Saved = {
        ...s,
        inspections: patchIn(s.inspections, id, (x) => ({
          ...x,
          items: x.items.map((i) =>
            i.id === itemId ? { ...i, result, note: note ?? i.note } : i,
          ),
        })),
      };
      // a failed item always leaves a corrective action behind
      if (result === "fail" && insp && item) {
        const title = `Fix: ${item.text}`;
        const exists = next.actions.some(
          (a) =>
            a.title === title &&
            a.sourceLabel === insp.title &&
            a.status === "Open",
        );
        if (!exists)
          next = {
            ...next,
            actions: [
              {
                id: `a-${uid()}`,
                projectId: insp.projectId,
                title,
                source: "Inspection",
                sourceLabel: insp.title,
                owner: insp.inspector,
                due: todayISO(),
                status: "Open",
              },
              ...next.actions,
            ],
            audit: [
              ev(
                "Inspections",
                insp.projectId,
                `failed "${item.text}" and raised a corrective action`,
                "Unchecked",
                "Failed",
              ),
              ...next.audit,
            ],
          };
      }
      return next;
    });
  },
  completeInspection: (id) => {
    const insp = current().inspections.find((x) => x.id === id);
    act(
      (s) => ({
        ...s,
        inspections: patchIn(s.inspections, id, (x) => ({
          ...x,
          status: "Complete",
        })),
      }),
      ev(
        "Inspections",
        insp?.projectId ?? ALL,
        `completed the ${insp?.title.toLowerCase() ?? "inspection"}`,
        "In progress",
        "Complete",
      ),
    );
  },

  reportIncident: (i) => {
    const id = `inc-${uid()}`;
    act(
      (s) => ({
        ...s,
        incidents: [
          { ...i, id, status: "Reported", notifiable: null, cause: "" },
          ...s.incidents,
        ],
      }),
      ev(
        "Incidents",
        i.projectId,
        `reported a ${i.type.toLowerCase()}: ${i.title}`,
        "No report",
        "Reported",
      ),
    );
    return id;
  },
  updateIncident: (id, patch) =>
    update((s) => ({
      ...s,
      incidents: patchIn(s.incidents, id, (x) => ({ ...x, ...patch })),
    })),
  advanceIncident: (id, to) => {
    const inc = current().incidents.find((x) => x.id === id);
    act(
      (s) => ({
        ...s,
        incidents: patchIn(s.incidents, id, (x) => ({ ...x, status: to })),
      }),
      ev(
        "Incidents",
        inc?.projectId ?? ALL,
        `moved ${inc?.title ?? "an incident"} to ${to}`,
        inc?.status ?? "",
        to,
      ),
    );
  },

  addAction: (i) =>
    act(
      (s) => ({
        ...s,
        actions: [{ ...i, id: `a-${uid()}`, status: "Open" }, ...s.actions],
      }),
      ev(
        "Incidents",
        i.projectId,
        `raised the action ${i.title}`,
        "No action",
        "Open",
      ),
    ),
  toggleAction: (id) => {
    const a = current().actions.find((x) => x.id === id);
    const done = a?.status === "Done";
    act(
      (s) => ({
        ...s,
        actions: patchIn(s.actions, id, (x) => ({
          ...x,
          status: done ? "Open" : "Done",
        })),
      }),
      ev(
        "Incidents",
        a?.projectId ?? ALL,
        `${done ? "reopened" : "completed"} the action ${a?.title ?? ""}`.trim(),
        done ? "Done" : "Open",
        done ? "Open" : "Done",
      ),
    );
  },
  removeAction: (id) =>
    update((s) => ({ ...s, actions: s.actions.filter((x) => x.id !== id) })),

  inviteMember: (m) =>
    act(
      (s) => ({
        ...s,
        members: [
          ...s.members,
          { ...m, id: `m-${uid()}`, status: "Invited", lastActive: "Never" },
        ],
      }),
      ev(
        "Settings",
        ALL,
        `invited ${m.name} as ${m.role}`,
        "Not invited",
        "Invited",
      ),
    ),
  updateMember: (id, patch) =>
    update((s) => ({
      ...s,
      members: patchIn(s.members, id, (m) => ({ ...m, ...patch })),
    })),
  removeMember: (id) =>
    update((s) => ({ ...s, members: s.members.filter((m) => m.id !== id) })),
  updateCompany: (patch) =>
    update((s) => ({
      ...s,
      settings: { ...s.settings, company: { ...s.settings.company, ...patch } },
    })),
  setNotify: (patch) =>
    update((s) => ({
      ...s,
      settings: { ...s.settings, notify: { ...s.settings.notify, ...patch } },
    })),
  setWarnDays: (n) =>
    update((s) => ({ ...s, settings: { ...s.settings, warnDays: n } })),

  resetDemo: () => writeSaved(SEED),
};

const Ctx = createContext<Store | null>(null);

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const saved = useSyncExternalStore(subscribe, readSaved, () => null);
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const state = saved ?? SEED;

  const value = useMemo<Store>(
    () => ({ ...state, ready, ...actions }),
    [ready, state],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside DemoStoreProvider");
  return v;
}

/**
 * Everything in the store, narrowed to the project picked in the top bar.
 * Workers and subcontractors belong to a project when they are assigned to it.
 */
export function useScope() {
  const s = useStore();
  return useMemo(() => {
    const all =
      s.projectId === ALL || !s.projects.some((p) => p.id === s.projectId);
    const id = all ? ALL : s.projectId;
    const inP = <T extends { projectId: string }>(l: T[]) =>
      all ? l : l.filter((x) => x.projectId === id);
    const inA = <T extends { projects: string[] }>(l: T[]) =>
      all ? l : l.filter((x) => x.projects.includes(id));
    return {
      ...s,
      all,
      scopeId: id,
      project: all ? undefined : s.projects.find((p) => p.id === id),
      scopeLabel: all
        ? "All projects"
        : (s.projects.find((p) => p.id === id)?.name ?? "All projects"),
      projectsIn: all ? s.projects : s.projects.filter((p) => p.id === id),
      swmsIn: inP(s.swms),
      risksIn: inP(s.risks),
      talksIn: inP(s.talks),
      inspectionsIn: inP(s.inspections),
      incidentsIn: inP(s.incidents),
      actionsIn: inP(s.actions),
      auditIn: all
        ? s.audit
        : s.audit.filter((x) => x.projectId === id || x.projectId === ALL),
      workersIn: inA(s.workers),
      subsIn: inA(s.subs),
    };
  }, [s]);
}

export { INCIDENT_FLOW, initialsOf };
