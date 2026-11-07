import { todayISO } from "./format";

/* ---------- helpers ---------- */

export const addDays = (n: number, from = todayISO()) => {
  const [y, m, d] = from.split("-").map(Number);
  const t = new Date(y, m - 1, d + n);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
};

/** Whole days from today to a date. Negative means it has passed. */
export const daysUntil = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const [ty, tm, td] = todayISO().split("-").map(Number);
  return Math.round(
    (new Date(y, m - 1, d).getTime() - new Date(ty, tm - 1, td).getTime()) /
      86400000,
  );
};

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/* ---------- types ---------- */

export type ProjectStatus = "Live" | "Starting" | "Handover" | "Complete";

export type Project = {
  id: string;
  name: string;
  address: string;
  client: string;
  stage: string;
  manager: string;
  status: ProjectStatus;
  start: string;
  /** worker ids currently signed on at the gate */
  onSite: string[];
};

export type Ticket = {
  id: string;
  kind: string;
  number: string;
  expires: string | null;
};

export type Worker = {
  id: string;
  name: string;
  role: string;
  /** subcontractor id, or "own" for direct employees */
  company: string;
  phone: string;
  projects: string[];
  tickets: Ticket[];
  inducted: string[];
};

export type SubDoc = { id: string; kind: string; expires: string | null };

export type Subcontractor = {
  id: string;
  name: string;
  trade: string;
  contact: string;
  phone: string;
  projects: string[];
  approved: boolean;
  docs: SubDoc[];
};

export type RiskLevel = "Low" | "Medium" | "High" | "Extreme";

export type SwmsStep = {
  id: string;
  task: string;
  hazard: string;
  controls: string;
  risk: RiskLevel;
};

export type Swms = {
  id: string;
  title: string;
  projectId: string;
  version: number;
  status: "Draft" | "Active" | "Superseded";
  highRisk: boolean;
  steps: SwmsStep[];
  required: string[];
  signed: string[];
  owner: string;
  updated: string;
};

export type Risk = {
  id: string;
  projectId: string;
  hazard: string;
  category: string;
  likelihood: number;
  consequence: number;
  controls: string;
  resL: number;
  resC: number;
  owner: string;
  review: string;
  status: "Open" | "Controlled" | "Closed";
};

export type Talk = {
  id: string;
  projectId: string;
  topic: string;
  date: string;
  presenter: string;
  notes: string;
  expected: string[];
  attended: string[];
};

export type InspResult = "pass" | "fail" | "na" | null;

export type Inspection = {
  id: string;
  projectId: string;
  title: string;
  kind: string;
  date: string;
  inspector: string;
  items: { id: string; text: string; result: InspResult; note: string }[];
  status: "In progress" | "Complete";
};

export type IncidentType =
  | "Near miss"
  | "Hazard"
  | "First aid"
  | "Injury"
  | "Property damage"
  | "Dangerous incident";

export type IncidentStatus =
  "Reported" | "Investigating" | "Corrective actions" | "Closed";

export const INCIDENT_FLOW: IncidentStatus[] = [
  "Reported",
  "Investigating",
  "Corrective actions",
  "Closed",
];

export type Incident = {
  id: string;
  projectId: string;
  type: IncidentType;
  title: string;
  date: string;
  time: string;
  location: string;
  reporter: string;
  people: string;
  description: string;
  severity: RiskLevel;
  /** null until someone has assessed it */
  notifiable: boolean | null;
  status: IncidentStatus;
  cause: string;
};

export type Action = {
  id: string;
  projectId: string;
  title: string;
  source: "Incident" | "Inspection" | "Risk" | "Audit" | "Manual";
  sourceLabel: string;
  owner: string;
  due: string;
  status: "Open" | "Done";
};

export type AuditArea =
  | "SWMS"
  | "Risks"
  | "Toolbox"
  | "Inspections"
  | "Incidents"
  | "People"
  | "Projects"
  | "Settings";

export type AuditEvent = {
  id: string;
  day: string;
  t: string;
  who: string;
  name: string;
  act: string;
  from: string;
  to: string;
  area: AuditArea;
  projectId: string;
};

export type Role = "Owner" | "Admin" | "Site manager" | "Worker" | "Inspector";
export const ROLES: Role[] = [
  "Owner",
  "Admin",
  "Site manager",
  "Worker",
  "Inspector",
];

export type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Invited";
  lastActive: string;
};

export type Settings = {
  company: { name: string; abn: string; email: string; phone: string };
  notify: {
    tickets: boolean;
    insurances: boolean;
    actions: boolean;
    incidents: boolean;
  };
  /** days of warning before a ticket or document expires */
  warnDays: number;
};

export const me = {
  name: "Sam Kowalski",
  initials: "SK",
  role: "Site manager",
};

/* ---------- risk maths ---------- */

export const LIKELIHOOD = [
  "Rare",
  "Unlikely",
  "Possible",
  "Likely",
  "Almost certain",
];
export const CONSEQUENCE = [
  "Insignificant",
  "Minor",
  "Moderate",
  "Major",
  "Catastrophic",
];

export function rating(l: number, c: number): RiskLevel {
  const s = l * c;
  if (s >= 15) return "Extreme";
  if (s >= 10) return "High";
  if (s >= 5) return "Medium";
  return "Low";
}

/* ---------- ticket and document status ---------- */

export type Expiry = "valid" | "soon" | "expired" | "none";

export function expiryOf(iso: string | null, warn = 30): Expiry {
  if (!iso) return "none";
  const d = daysUntil(iso);
  if (d < 0) return "expired";
  if (d <= warn) return "soon";
  return "valid";
}

export const TICKET_KINDS = [
  "General construction induction (white card)",
  "High risk work licence, scaffolding",
  "High risk work licence, dogging",
  "High risk work licence, rigging",
  "High risk work licence, crane",
  "High risk work licence, EWP",
  "High risk work licence, forklift",
  "Electrical licence",
  "Plumbing licence",
  "Working at heights",
  "Confined space",
  "First aid",
  "Asbestos awareness",
];

export const DOC_KINDS = [
  "Public liability insurance",
  "Workers' compensation",
  "Contractor licence",
  "Safety policy",
  "Prequalification form",
];

export const RISK_CATEGORIES = [
  "Falls from height",
  "Plant and vehicles",
  "Manual handling",
  "Electrical",
  "Hazardous substances",
  "Excavation",
  "Noise and dust",
  "Fire",
  "Other",
];

export const INSPECTION_TEMPLATES: Record<string, string[]> = {
  "Daily site walk": [
    "Site perimeter fenced and signed",
    "Walkways and access clear",
    "Housekeeping and waste controlled",
    "First aid kit stocked and located",
    "Fire extinguishers present and tagged",
    "Amenities clean and available",
    "Emergency plan and muster point displayed",
  ],
  "Scaffold inspection": [
    "Scaffold tagged and inspected within the last 7 days",
    "Base plates and sole boards in place",
    "Edge protection and toe boards complete",
    "Access ladders secure",
    "Ties and bracing intact",
    "Load limits displayed",
  ],
  "Plant and equipment": [
    "Pre-start check completed",
    "Operator licence sighted",
    "Guards and safety devices fitted",
    "Reversing alarm and lights working",
    "Test and tag current",
    "Exclusion zone marked",
  ],
  "Electrical and leads": [
    "Leads free of damage",
    "RCDs tested",
    "Switchboard closed and labelled",
    "Leads off the ground or protected",
    "Test and tag current",
  ],
  Excavation: [
    "Underground services located",
    "Shoring or battering in place",
    "Edge protection and barriers",
    "Spoil kept clear of the edge",
    "Access and egress provided",
  ],
};

export const TALK_TOPICS = [
  "Working at heights",
  "Manual handling",
  "Slips, trips and falls",
  "Hot work and fire",
  "Silica dust",
  "Plant and pedestrian separation",
  "Heat stress",
  "Electrical safety",
  "Housekeeping",
  "Reporting hazards and near misses",
];

/* ---------- seed data ---------- */

const T = todayISO();

export const seedProjects: Project[] = [
  {
    id: "p-marsh",
    name: "14 Marsh Ave",
    address: "14 Marsh Avenue, Newtown",
    client: "Harlow Developments",
    stage: "Concrete structure, Level 3",
    manager: "Sam Kowalski",
    status: "Live",
    start: addDays(-120),
    onSite: ["w-dunn", "w-nguyen", "w-okafor", "w-kim", "w-silva"],
  },
  {
    id: "p-quarry",
    name: "8 Quarry Rd",
    address: "8 Quarry Road, Marrickville",
    client: "Stonebridge Group",
    stage: "Stage 2, services rough-in",
    manager: "Dana Whitfield",
    status: "Live",
    start: addDays(-210),
    onSite: ["w-becker", "w-reyes"],
  },
  {
    id: "p-harbour",
    name: "Harbour St fit-out",
    address: "Level 2, 31 Harbour Street, Sydney",
    client: "Meridian Legal",
    stage: "Demolition and strip-out",
    manager: "Sam Kowalski",
    status: "Starting",
    start: addDays(5),
    onSite: [],
  },
];

export const seedSubcontractors: Subcontractor[] = [
  {
    id: "s-apex",
    name: "Apex Scaffolding",
    trade: "Scaffolding",
    contact: "Luca Romano",
    phone: "0411 220 118",
    projects: ["p-marsh", "p-quarry"],
    approved: true,
    docs: [
      { id: "d1", kind: "Public liability insurance", expires: addDays(34) },
      { id: "d2", kind: "Workers' compensation", expires: addDays(160) },
      { id: "d3", kind: "Safety policy", expires: null },
    ],
  },
  {
    id: "s-ridge",
    name: "Ridgeline Concrete",
    trade: "Formwork and concrete",
    contact: "Tom Hartley",
    phone: "0402 551 903",
    projects: ["p-marsh"],
    approved: true,
    docs: [
      { id: "d4", kind: "Public liability insurance", expires: addDays(210) },
      { id: "d5", kind: "Workers' compensation", expires: addDays(-6) },
      { id: "d6", kind: "Contractor licence", expires: addDays(400) },
    ],
  },
  {
    id: "s-volt",
    name: "Voltline Electrical",
    trade: "Electrical",
    contact: "Priya Nair",
    phone: "0433 908 276",
    projects: ["p-quarry", "p-harbour"],
    approved: true,
    docs: [
      { id: "d7", kind: "Public liability insurance", expires: addDays(120) },
      { id: "d8", kind: "Workers' compensation", expires: addDays(90) },
      { id: "d9", kind: "Contractor licence", expires: addDays(25) },
    ],
  },
  {
    id: "s-clear",
    name: "ClearCut Demolition",
    trade: "Demolition",
    contact: "Mark Ellis",
    phone: "0418 774 330",
    projects: ["p-harbour"],
    approved: false,
    docs: [
      { id: "d10", kind: "Public liability insurance", expires: addDays(200) },
      { id: "d11", kind: "Prequalification form", expires: null },
    ],
  },
];

export const seedWorkers: Worker[] = [
  {
    id: "w-dunn",
    name: "Ryan Dunn",
    role: "Foreman",
    company: "own",
    phone: "0412 100 201",
    projects: ["p-marsh"],
    inducted: ["p-marsh"],
    tickets: [
      { id: "t1", kind: TICKET_KINDS[0], number: "WC-483920", expires: null },
      {
        id: "t2",
        kind: "First aid",
        number: "FA-22819",
        expires: addDays(140),
      },
    ],
  },
  {
    id: "w-nguyen",
    name: "Tran Nguyen",
    role: "Dogman",
    company: "own",
    phone: "0412 100 202",
    projects: ["p-marsh"],
    inducted: ["p-marsh"],
    tickets: [
      { id: "t3", kind: TICKET_KINDS[0], number: "WC-301177", expires: null },
      {
        id: "t4",
        kind: TICKET_KINDS[2],
        number: "DG-77120",
        expires: addDays(300),
      },
    ],
  },
  {
    id: "w-okafor",
    name: "Michael Okafor",
    role: "EWP operator",
    company: "own",
    phone: "0412 100 203",
    projects: ["p-marsh", "p-quarry"],
    inducted: ["p-marsh"],
    tickets: [
      { id: "t5", kind: TICKET_KINDS[0], number: "WC-558204", expires: null },
      {
        id: "t6",
        kind: TICKET_KINDS[5],
        number: "WP-90314",
        expires: addDays(18),
      },
    ],
  },
  {
    id: "w-kim",
    name: "Jae Kim",
    role: "Carpenter",
    company: "s-ridge",
    phone: "0412 100 204",
    projects: ["p-marsh"],
    inducted: ["p-marsh"],
    tickets: [
      { id: "t7", kind: TICKET_KINDS[0], number: "WC-640018", expires: null },
      {
        id: "t8",
        kind: "Working at heights",
        number: "WAH-4410",
        expires: addDays(-12),
      },
    ],
  },
  {
    id: "w-silva",
    name: "Carlos Silva",
    role: "Scaffolder",
    company: "s-apex",
    phone: "0412 100 205",
    projects: ["p-marsh", "p-quarry"],
    inducted: ["p-marsh"],
    tickets: [
      { id: "t9", kind: TICKET_KINDS[0], number: "WC-229931", expires: null },
      {
        id: "t10",
        kind: TICKET_KINDS[1],
        number: "SB-18822",
        expires: addDays(75),
      },
    ],
  },
  {
    id: "w-petrov",
    name: "Lena Petrov",
    role: "Labourer",
    company: "s-ridge",
    phone: "0412 100 206",
    projects: ["p-marsh"],
    inducted: [],
    tickets: [
      { id: "t11", kind: TICKET_KINDS[0], number: "WC-771045", expires: null },
    ],
  },
  {
    id: "w-becker",
    name: "Tom Becker",
    role: "Electrician",
    company: "s-volt",
    phone: "0412 100 207",
    projects: ["p-quarry", "p-harbour"],
    inducted: ["p-quarry"],
    tickets: [
      { id: "t12", kind: TICKET_KINDS[0], number: "WC-100239", expires: null },
      {
        id: "t13",
        kind: TICKET_KINDS[7],
        number: "EL-55012",
        expires: addDays(25),
      },
    ],
  },
  {
    id: "w-reyes",
    name: "Ana Reyes",
    role: "Site engineer",
    company: "own",
    phone: "0412 100 208",
    projects: ["p-quarry"],
    inducted: ["p-quarry"],
    tickets: [
      { id: "t14", kind: TICKET_KINDS[0], number: "WC-908112", expires: null },
      {
        id: "t15",
        kind: TICKET_KINDS[9],
        number: "WAH-9031",
        expires: addDays(210),
      },
    ],
  },
];

export const seedSwms: Swms[] = [
  {
    id: "sw-formwork",
    title: "Formwork and concrete pour",
    projectId: "p-marsh",
    version: 4,
    status: "Active",
    highRisk: true,
    owner: "Ryan Dunn",
    updated: addDays(-9),
    required: ["w-dunn", "w-nguyen", "w-okafor", "w-kim", "w-petrov"],
    signed: ["w-dunn", "w-nguyen", "w-okafor", "w-kim"],
    steps: [
      {
        id: "st1",
        task: "Erect formwork at height",
        hazard: "Fall from height",
        controls:
          "Edge protection and scaffold platform; harness where edge protection is not practicable; exclusion zone below.",
        risk: "High",
      },
      {
        id: "st2",
        task: "Pump and place concrete",
        hazard: "Hose whip, manual handling, wet concrete burns",
        controls:
          "Trained hose operator, kinked-hose checks, PPE including gloves and eye protection, rotation of tasks.",
        risk: "Medium",
      },
      {
        id: "st3",
        task: "Strip and stack formwork",
        hazard: "Struck by falling objects",
        controls:
          "Exclusion zone below, controlled stripping sequence, stack height limits.",
        risk: "Medium",
      },
    ],
  },
  {
    id: "sw-scaffold",
    title: "Scaffold alteration, Level 3",
    projectId: "p-marsh",
    version: 2,
    status: "Active",
    highRisk: true,
    owner: "Ryan Dunn",
    updated: addDays(-1),
    required: ["w-dunn", "w-silva", "w-kim", "w-petrov"],
    signed: ["w-dunn"],
    steps: [
      {
        id: "st4",
        task: "Remove and refit bay ties",
        hazard: "Scaffold collapse, fall from height",
        controls:
          "Licensed scaffolder only, tags updated, no loading during alteration, engineer approval for tie removal.",
        risk: "High",
      },
    ],
  },
  {
    id: "sw-excav",
    title: "Trenching for stormwater",
    projectId: "p-quarry",
    version: 1,
    status: "Active",
    highRisk: true,
    owner: "Dana Whitfield",
    updated: addDays(-20),
    required: ["w-becker", "w-reyes"],
    signed: ["w-becker", "w-reyes"],
    steps: [
      {
        id: "st5",
        task: "Excavate trench to 1.8 m",
        hazard: "Trench collapse, underground services",
        controls:
          "Dial before you dig, shoring in place, edge barriers, spoil set back.",
        risk: "Extreme",
      },
    ],
  },
  {
    id: "sw-demo",
    title: "Strip-out of ceilings and partitions",
    projectId: "p-harbour",
    version: 1,
    status: "Draft",
    highRisk: false,
    owner: "Sam Kowalski",
    updated: addDays(-2),
    required: [],
    signed: [],
    steps: [
      {
        id: "st6",
        task: "Remove ceiling tiles and grid",
        hazard: "Dust, asbestos-containing materials",
        controls:
          "Asbestos register checked, dust suppression, P2 respirators.",
        risk: "Medium",
      },
    ],
  },
];

export const seedRisks: Risk[] = [
  {
    id: "r1",
    projectId: "p-marsh",
    hazard: "Unprotected edges on Level 3 slab",
    category: "Falls from height",
    likelihood: 4,
    consequence: 5,
    controls:
      "Temporary edge protection, daily inspection, exclusion zone below",
    resL: 2,
    resC: 5,
    owner: "Ryan Dunn",
    review: addDays(12),
    status: "Controlled",
  },
  {
    id: "r2",
    projectId: "p-marsh",
    hazard: "Mobile crane operating near the street",
    category: "Plant and vehicles",
    likelihood: 3,
    consequence: 5,
    controls: "Traffic management plan, spotter, dogman, exclusion zone",
    resL: 2,
    resC: 4,
    owner: "Sam Kowalski",
    review: addDays(-3),
    status: "Open",
  },
  {
    id: "r3",
    projectId: "p-marsh",
    hazard: "Silica dust from concrete cutting",
    category: "Hazardous substances",
    likelihood: 4,
    consequence: 4,
    controls: "Wet cutting, on-tool extraction, P2 respirators, air monitoring",
    resL: 2,
    resC: 3,
    owner: "Ryan Dunn",
    review: addDays(30),
    status: "Controlled",
  },
  {
    id: "r4",
    projectId: "p-quarry",
    hazard: "Trench collapse during stormwater works",
    category: "Excavation",
    likelihood: 3,
    consequence: 5,
    controls: "Shoring, barriers, daily inspection, competent person on site",
    resL: 1,
    resC: 5,
    owner: "Dana Whitfield",
    review: addDays(20),
    status: "Controlled",
  },
  {
    id: "r5",
    projectId: "p-quarry",
    hazard: "Temporary power leads across walkways",
    category: "Electrical",
    likelihood: 3,
    consequence: 3,
    controls: "Leads raised, RCDs, weekly test and tag",
    resL: 2,
    resC: 3,
    owner: "Tom Becker",
    review: addDays(8),
    status: "Open",
  },
  {
    id: "r6",
    projectId: "p-harbour",
    hazard: "Asbestos-containing materials in ceiling space",
    category: "Hazardous substances",
    likelihood: 3,
    consequence: 5,
    controls:
      "Asbestos survey, licensed removalist, no disturbance until cleared",
    resL: 1,
    resC: 5,
    owner: "Sam Kowalski",
    review: addDays(3),
    status: "Open",
  },
];

export const seedTalks: Talk[] = [
  {
    id: "tb1",
    projectId: "p-marsh",
    topic: "Working at heights",
    date: addDays(-2),
    presenter: "Ryan Dunn",
    notes: "Edge protection, harness inspection, rescue plan for Level 3.",
    expected: [
      "w-dunn",
      "w-nguyen",
      "w-okafor",
      "w-kim",
      "w-silva",
      "w-petrov",
    ],
    attended: ["w-dunn", "w-nguyen", "w-okafor", "w-kim", "w-silva"],
  },
  {
    id: "tb2",
    projectId: "p-marsh",
    topic: "Silica dust",
    date: addDays(5),
    presenter: "Sam Kowalski",
    notes: "",
    expected: [
      "w-dunn",
      "w-nguyen",
      "w-okafor",
      "w-kim",
      "w-silva",
      "w-petrov",
    ],
    attended: [],
  },
  {
    id: "tb3",
    projectId: "p-quarry",
    topic: "Electrical safety",
    date: addDays(-6),
    presenter: "Dana Whitfield",
    notes: "Leads, RCDs and isolation before work.",
    expected: ["w-becker", "w-reyes"],
    attended: ["w-becker", "w-reyes"],
  },
];

export const seedInspections: Inspection[] = [
  {
    id: "in1",
    projectId: "p-marsh",
    title: "Daily site walk",
    kind: "Daily site walk",
    date: T,
    inspector: "Sam Kowalski",
    status: "In progress",
    items: INSPECTION_TEMPLATES["Daily site walk"].map((text, i) => ({
      id: `i${i}`,
      text,
      result: i < 4 ? "pass" : null,
      note: "",
    })),
  },
  {
    id: "in2",
    projectId: "p-marsh",
    title: "Scaffold inspection",
    kind: "Scaffold inspection",
    date: addDays(-1),
    inspector: "Ryan Dunn",
    status: "Complete",
    items: INSPECTION_TEMPLATES["Scaffold inspection"].map((text, i) => ({
      id: `i${i}`,
      text,
      result: i === 3 ? "fail" : "pass",
      note: i === 3 ? "Bay 4 ladder lashing loose, retied and re-checked." : "",
    })),
  },
  {
    id: "in3",
    projectId: "p-quarry",
    title: "Excavation",
    kind: "Excavation",
    date: addDays(-4),
    inspector: "Dana Whitfield",
    status: "Complete",
    items: INSPECTION_TEMPLATES["Excavation"].map((text, i) => ({
      id: `i${i}`,
      text,
      result: "pass",
      note: "",
    })),
  },
];

export const seedIncidents: Incident[] = [
  {
    id: "inc1",
    projectId: "p-marsh",
    type: "Near miss",
    title: "Formwork tie dropped from Level 3",
    date: T,
    time: "10:20",
    location: "Level 3, grid C4",
    reporter: "Ryan Dunn",
    people: "No one injured. Two workers on Level 2.",
    description:
      "A loose tie fell about 3 m and landed in the exclusion zone. No one was beneath it.",
    severity: "High",
    notifiable: false,
    status: "Investigating",
    cause: "",
  },
  {
    id: "inc2",
    projectId: "p-quarry",
    type: "First aid",
    title: "Minor laceration, hand",
    date: addDays(-9),
    time: "14:05",
    location: "Stage 2 plant room",
    reporter: "Dana Whitfield",
    people: "Tom Becker",
    description:
      "Cut to the left hand on sheet metal edge. First aid applied on site.",
    severity: "Low",
    notifiable: false,
    status: "Closed",
    cause: "Unprotected sheet metal edge, gloves not worn.",
  },
  {
    id: "inc3",
    projectId: "p-marsh",
    type: "Hazard",
    title: "Damaged lead near Level 2 stairs",
    date: addDays(-3),
    time: "07:40",
    location: "Level 2 stair core",
    reporter: "Tran Nguyen",
    people: "",
    description:
      "Insulation cut on an extension lead across the stair landing.",
    severity: "Medium",
    notifiable: false,
    status: "Corrective actions",
    cause: "Lead run across a walkway and driven over by a trolley.",
  },
];

export const seedActions: Action[] = [
  {
    id: "a1",
    projectId: "p-marsh",
    title: "Install lanyards on all loose formwork ties",
    source: "Incident",
    sourceLabel: "Formwork tie dropped from Level 3",
    owner: "Ryan Dunn",
    due: addDays(2),
    status: "Open",
  },
  {
    id: "a2",
    projectId: "p-marsh",
    title: "Replace damaged lead and add cable ramps on stairs",
    source: "Incident",
    sourceLabel: "Damaged lead near Level 2 stairs",
    owner: "Tran Nguyen",
    due: addDays(-2),
    status: "Open",
  },
  {
    id: "a3",
    projectId: "p-marsh",
    title: "Re-tag scaffold bay 4 after ladder lashing repair",
    source: "Inspection",
    sourceLabel: "Scaffold inspection",
    owner: "Carlos Silva",
    due: addDays(1),
    status: "Done",
  },
  {
    id: "a4",
    projectId: "p-quarry",
    title: "Supply cut-resistant gloves to plant room crew",
    source: "Incident",
    sourceLabel: "Minor laceration, hand",
    owner: "Dana Whitfield",
    due: addDays(-6),
    status: "Done",
  },
  {
    id: "a5",
    projectId: "p-harbour",
    title: "Obtain asbestos survey before strip-out starts",
    source: "Risk",
    sourceLabel: "Asbestos in ceiling space",
    owner: "Sam Kowalski",
    due: addDays(3),
    status: "Open",
  },
];

export const seedAudit: AuditEvent[] = [
  {
    id: "e1",
    day: "Today",
    t: "10:31",
    who: "SK",
    name: "Sam Kowalski",
    act: "moved the formwork tie near miss to Investigating",
    from: "Reported",
    to: "Investigating",
    area: "Incidents",
    projectId: "p-marsh",
  },
  {
    id: "e2",
    day: "Today",
    t: "10:20",
    who: "RD",
    name: "Ryan Dunn",
    act: "reported a near miss on Level 3",
    from: "No report",
    to: "Reported",
    area: "Incidents",
    projectId: "p-marsh",
  },
  {
    id: "e3",
    day: "Today",
    t: "07:05",
    who: "RD",
    name: "Ryan Dunn",
    act: "signed the scaffold alteration SWMS",
    from: "Unsigned",
    to: "Signed",
    area: "SWMS",
    projectId: "p-marsh",
  },
  {
    id: "e4",
    day: "Yesterday",
    t: "16:12",
    who: "DW",
    name: "Dana Whitfield",
    act: "approved Voltline Electrical for 8 Quarry Rd",
    from: "Pending",
    to: "Approved",
    area: "People",
    projectId: "p-quarry",
  },
];

export const seedMembers: Member[] = [
  {
    id: "m1",
    name: "Dana Whitfield",
    email: "dana@example.com",
    role: "Owner",
    status: "Active",
    lastActive: "Today",
  },
  {
    id: "m2",
    name: "Sam Kowalski",
    email: "sam@example.com",
    role: "Site manager",
    status: "Active",
    lastActive: "Today",
  },
  {
    id: "m3",
    name: "Ryan Dunn",
    email: "ryan@example.com",
    role: "Site manager",
    status: "Active",
    lastActive: "Today",
  },
  {
    id: "m4",
    name: "Priya Shah",
    email: "priya@example.com",
    role: "Inspector",
    status: "Invited",
    lastActive: "Never",
  },
];

export const seedSettings: Settings = {
  company: {
    name: "Northgate Builders",
    abn: "12 345 678 901",
    email: "safety@example.com",
    phone: "02 5550 0142",
  },
  notify: { tickets: true, insurances: true, actions: true, incidents: true },
  warnDays: 30,
};
