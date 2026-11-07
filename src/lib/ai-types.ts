/** Shapes shared by the AI routes and the dashboard. */

export type AiFile = { mediaType: string; data: string; name?: string };

export type AiTask =
  | "incident"
  | "swms"
  | "swmsReview"
  | "risk"
  | "hazardPhoto"
  | "talk"
  | "summary"
  | "investigate"
  | "scan"
  | "template"
  | "beautify"
  | "scanNotes"
  | "defect"
  | "drawing";

export type IncidentDraft = {
  title: string;
  type: string;
  severity: string;
  location: string;
  people: string;
  description: string;
  date: string;
  time: string;
  notifiable: boolean | null;
  notifiableReason: string;
  actions: string[];
};

export type SwmsDraft = {
  title: string;
  highRisk: boolean;
  steps: { task: string; hazard: string; controls: string; risk: string }[];
};

export type SwmsReview = {
  summary: string;
  findings: { level: "gap" | "improve" | "ok"; issue: string; fix: string }[];
};

export type RiskDraft = {
  category: string;
  likelihood: number;
  consequence: number;
  controls: string;
  resL: number;
  resC: number;
};

export type HazardPhoto = {
  hazards: (RiskDraft & { hazard: string })[];
  summary: string;
};

export type TalkDraft = { topic: string; notes: string };

export type SummaryDraft = { text: string };

export type Investigation = {
  summary: string;
  causes: string[];
  actions: { title: string; days: number }[];
  notifiableNote: string;
};

export type ScanResult = {
  docType: "ticket" | "insurance" | "other";
  holder: string;
  kind: string;
  number: string;
  expires: string | null;
  notes: string;
};

export type TemplateDraft = { name: string; items: string[] };

export type BeautifyResult = { text: string };

export type ScanNotes = { text: string };

/** What the chat assistant may ask the user to confirm. Nothing is applied without a click. */
export type Proposal =
  | {
      type: "create_action";
      title: string;
      owner: string;
      days: number;
      project: string;
    }
  | {
      type: "report_incident";
      title: string;
      incidentType: string;
      severity: string;
      location: string;
      description: string;
      project: string;
    }
  | {
      type: "schedule_talk";
      topic: string;
      days: number;
      notes: string;
      project: string;
    }
  | {
      type: "add_risk";
      hazard: string;
      category: string;
      likelihood: number;
      consequence: number;
      controls: string;
      project: string;
    };

export type DefectDraft = {
  title: string;
  description: string;
  location: string;
  priority: string;
  assignee: string;
  days: number;
};

export type DrawingRead = {
  number: string;
  title: string;
  revision: string;
  discipline: string;
};
