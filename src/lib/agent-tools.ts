/**
 * The actions the Assistant agent can take. The model only ever sees these definitions; the work itself
 * runs in the browser against the user's workspace. Tools marked `write` change data, so the user approves
 * each one before it runs (unless they have switched approval off for the chat).
 *
 * Deliberately absent: anything that signs, approves or certifies on someone else's behalf (SWMS and
 * induction signatures, permit approval, subcontractor approval, inspection results, ticket records),
 * anything that closes or deletes a record, and anything that changes the team, settings or billing.
 * Those are safety decisions a person must make. The agent says so and points to the right page instead.
 */
export type AgentTool = {
  name: string;
  description: string;
  write: boolean;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
};

const str = (description: string) => ({ type: "string", description });
const iso = (description: string) => ({
  type: "string",
  description: `${description} Format yyyy-mm-dd.`,
});
const pid = str("Project id from list_projects.");

const SEVERITY = ["Low", "Medium", "High", "Extreme"];
const CATEGORIES = [
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

export const AGENT_TOOLS: AgentTool[] = [
  /* ---------- look things up ---------- */
  {
    name: "list_projects",
    write: false,
    description:
      "List every project with its id, status, stage, manager, how many people are signed on right now and hours worked. Use to find a project id.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "list_workers",
    write: false,
    description:
      "List workers with ids, role, employer, assigned projects, which projects they are inducted to, whether they are signed on, and any ticket or licence that has expired or is expiring.",
    input_schema: {
      type: "object",
      properties: {
        project_id: str("Only workers assigned to this project."),
        issues_only: {
          type: "boolean",
          description: "Only workers with an expired or expiring ticket.",
        },
      },
    },
  },
  {
    name: "list_subcontractors",
    write: false,
    description:
      "List subcontractors with approval status, prequalification progress and any insurance or licence that is expired or expiring.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "list_swms",
    write: false,
    description:
      "List safe work method statements with id, project, status, version, high risk flag, steps and who still has to sign. Use to find a SWMS id.",
    input_schema: {
      type: "object",
      properties: {
        project_id: pid,
        unsigned_only: {
          type: "boolean",
          description: "Only active SWMS that someone still has to sign.",
        },
      },
    },
  },
  {
    name: "list_risks",
    write: false,
    description:
      "List the risk register with id, hazard, project, inherent and residual rating, status, owner and review date.",
    input_schema: {
      type: "object",
      properties: { project_id: pid },
    },
  },
  {
    name: "list_permits",
    write: false,
    description:
      "List permits to work with id, type, project, status, validity dates and how many safety checks are ticked.",
    input_schema: { type: "object", properties: { project_id: pid } },
  },
  {
    name: "list_plant",
    write: false,
    description:
      "List plant and equipment with id, status, defects, next service, test and tag date and whether today's pre-start is done.",
    input_schema: { type: "object", properties: { project_id: pid } },
  },
  {
    name: "list_chemicals",
    write: false,
    description:
      "List hazardous chemicals with project, hazard class, storage and whether a current safety data sheet is on file.",
    input_schema: { type: "object", properties: { project_id: pid } },
  },
  {
    name: "list_inspections",
    write: false,
    description:
      "List inspections with id, project, date, status and any failed items.",
    input_schema: { type: "object", properties: { project_id: pid } },
  },
  {
    name: "list_incidents",
    write: false,
    description:
      "List incidents, near misses and hazard reports with id, type, severity, status, notifiable assessment, cause and open actions.",
    input_schema: {
      type: "object",
      properties: {
        project_id: pid,
        open_only: {
          type: "boolean",
          description: "Only incidents not yet closed.",
        },
      },
    },
  },
  {
    name: "list_actions",
    write: false,
    description:
      "List corrective actions with id, project, owner, due date, status and what they came from.",
    input_schema: {
      type: "object",
      properties: {
        project_id: pid,
        status: { type: "string", enum: ["Open", "Done"] },
      },
    },
  },
  {
    name: "list_meetings",
    write: false,
    description:
      "List toolbox talks, pre-start meetings and WHS committee meetings with id, date, project and attendance.",
    input_schema: { type: "object", properties: { project_id: pid } },
  },
  {
    name: "list_defects",
    write: false,
    description:
      "List defects with id, project, location, priority, assignee, due date and status.",
    input_schema: {
      type: "object",
      properties: {
        project_id: pid,
        open_only: {
          type: "boolean",
          description: "Only defects not yet closed.",
        },
      },
    },
  },
  {
    name: "list_rfis",
    write: false,
    description:
      "List RFIs with id, number, subject, who it is to, due date and status.",
    input_schema: { type: "object", properties: { project_id: pid } },
  },
  {
    name: "list_diary",
    write: false,
    description:
      "List the latest site diary entries with weather, summary, delays, safety notes and attendance.",
    input_schema: { type: "object", properties: { project_id: pid } },
  },
  {
    name: "list_programme",
    write: false,
    description:
      "List programme tasks with dates, progress, and whether they need a SWMS before they start.",
    input_schema: { type: "object", properties: { project_id: pid } },
  },
  {
    name: "list_documents",
    write: false,
    description:
      "List policies, procedures and plans with version, review date and how many people have signed.",
    input_schema: { type: "object", properties: { project_id: pid } },
  },
  {
    name: "list_drawings",
    write: false,
    description: "List drawings with number, title and current revision.",
    input_schema: { type: "object", properties: { project_id: pid } },
  },
  {
    name: "list_notices",
    write: false,
    description:
      "List site notices with priority and how many people have read them.",
    input_schema: { type: "object", properties: { project_id: pid } },
  },
  {
    name: "list_visitors",
    write: false,
    description: "List visitors who are currently signed in, and recent ones.",
    input_schema: { type: "object", properties: { project_id: pid } },
  },
  {
    name: "list_emergency",
    write: false,
    description:
      "Emergency details for each project (assembly point, hospital, wardens) and the drills with their next due dates.",
    input_schema: { type: "object", properties: { project_id: pid } },
  },
  {
    name: "safety_stats",
    write: false,
    description:
      "Safety performance numbers: hours worked, lost time and recordable injuries, LTIFR and TRIFR, inspection pass rate, action closure, SWMS signature rate and ticket compliance. Optionally for one project.",
    input_schema: { type: "object", properties: { project_id: pid } },
  },
  {
    name: "list_audit",
    write: false,
    description:
      "The most recent entries in the audit log: who did what, and when.",
    input_schema: {
      type: "object",
      properties: { project_id: pid },
    },
  },
  {
    name: "open_page",
    write: false,
    description:
      "Show the user a link to a page in WHSCOMPLY, for example the SWMS to sign (/dashboard/swms/<id>), the permits page, or an incident (/dashboard/incidents/<id>). Use this to send them somewhere to finish what you cannot do yourself, such as signing, approving or closing something.",
    input_schema: {
      type: "object",
      properties: {
        path: str("Path starting with /dashboard/."),
        label: str("Short link text, for example 'Open the scaffold SWMS'."),
      },
      required: ["path", "label"],
    },
  },

  /* ---------- changes ---------- */
  {
    name: "create_action",
    write: true,
    description:
      "Raise a corrective action with an owner and a due date, for example to fix a hazard or follow up an incident.",
    input_schema: {
      type: "object",
      properties: {
        project_id: pid,
        title: str("What has to be done."),
        owner: str(
          "Who is responsible: a name from list_workers or a manager.",
        ),
        due: iso("Due date."),
        source_label: str(
          "Optional: what it came from, such as an incident title.",
        ),
      },
      required: ["project_id", "title", "owner", "due"],
    },
  },
  {
    name: "set_action_status",
    write: true,
    description: "Mark a corrective action done, or reopen it.",
    input_schema: {
      type: "object",
      properties: {
        action_id: str("Id from list_actions."),
        status: { type: "string", enum: ["Open", "Done"] },
      },
      required: ["action_id", "status"],
    },
  },
  {
    name: "report_incident",
    write: true,
    description:
      "Report an incident, near miss or hazard. It starts at Reported with notifiability unassessed: a person must assess and progress it.",
    input_schema: {
      type: "object",
      properties: {
        project_id: pid,
        type: {
          type: "string",
          enum: [
            "Near miss",
            "Hazard",
            "First aid",
            "Injury",
            "Property damage",
            "Dangerous incident",
          ],
        },
        title: str("Short headline."),
        severity: { type: "string", enum: SEVERITY },
        location: str("Where on site."),
        description: str("What happened, factually."),
        people: str("People involved, if any."),
        date: iso("When it happened. Defaults to today."),
        time: str("24 hour time like 10:30. Defaults to now."),
      },
      required: [
        "project_id",
        "type",
        "title",
        "severity",
        "location",
        "description",
      ],
    },
  },
  {
    name: "add_risk",
    write: true,
    description: "Add a hazard to the risk register with ratings and controls.",
    input_schema: {
      type: "object",
      properties: {
        project_id: pid,
        hazard: str("The hazard."),
        category: { type: "string", enum: CATEGORIES },
        likelihood: {
          type: "integer",
          description: "1 rare to 5 almost certain, before controls.",
        },
        consequence: {
          type: "integer",
          description: "1 insignificant to 5 catastrophic, before controls.",
        },
        controls: str(
          "Specific controls, following the hierarchy of controls.",
        ),
        residual_likelihood: {
          type: "integer",
          description: "1 to 5, after controls.",
        },
        residual_consequence: {
          type: "integer",
          description: "1 to 5, after controls.",
        },
        owner: str("Person responsible."),
        review: iso("Next review date."),
      },
      required: [
        "project_id",
        "hazard",
        "category",
        "likelihood",
        "consequence",
        "controls",
        "owner",
      ],
    },
  },
  {
    name: "schedule_talk",
    write: true,
    description:
      "Schedule a toolbox talk or a meeting. Everyone assigned to the project is added to the attendance list.",
    input_schema: {
      type: "object",
      properties: {
        project_id: pid,
        kind: {
          type: "string",
          enum: [
            "Toolbox talk",
            "Pre-start meeting",
            "WHS committee",
            "Coordination meeting",
          ],
        },
        topic: str("Topic or subject."),
        date: iso("Date."),
        presenter: str("Who runs it."),
        notes: str("Key points or agenda."),
      },
      required: ["project_id", "topic", "date"],
    },
  },
  {
    name: "log_defect",
    write: true,
    description:
      "Log a defect with a priority, location and who should fix it.",
    input_schema: {
      type: "object",
      properties: {
        project_id: pid,
        title: str("Short title."),
        description: str("What is wrong."),
        location: str("Where on site."),
        priority: {
          type: "string",
          enum: ["Low", "Medium", "High", "Critical"],
        },
        assignee: str("A subcontractor or person responsible."),
        due: iso("Due date."),
      },
      required: [
        "project_id",
        "title",
        "description",
        "location",
        "priority",
        "assignee",
        "due",
      ],
    },
  },
  {
    name: "set_defect_status",
    write: true,
    description: "Move a defect to another stage.",
    input_schema: {
      type: "object",
      properties: {
        defect_id: str("Id from list_defects."),
        status: {
          type: "string",
          enum: ["Open", "In progress", "Ready to inspect", "Closed"],
        },
      },
      required: ["defect_id", "status"],
    },
  },
  {
    name: "raise_rfi",
    write: true,
    description: "Raise a request for information.",
    input_schema: {
      type: "object",
      properties: {
        project_id: pid,
        subject: str("Subject."),
        question: str("The question."),
        to: str("Who it is directed to, for example Structural engineer."),
        due: iso("Answer needed by."),
      },
      required: ["project_id", "subject", "question", "to", "due"],
    },
  },
  {
    name: "add_diary_entry",
    write: true,
    description:
      "Write a site diary entry. Attendance is taken from who is signed on at the gate right now.",
    input_schema: {
      type: "object",
      properties: {
        project_id: pid,
        date: iso("Date. Defaults to today."),
        weather: {
          type: "string",
          enum: ["Fine", "Overcast", "Rain", "Storm", "Hot", "Windy"],
        },
        summary: str("One line summary of the day."),
        work_done: str("Work completed."),
        delays: str("Delays, if any."),
        safety_notes: str("Safety notes, if any."),
      },
      required: ["project_id", "summary", "work_done"],
    },
  },
  {
    name: "post_notice",
    write: true,
    description:
      "Post a site notice or safety alert for the crew. Use project_id all for the whole business.",
    input_schema: {
      type: "object",
      properties: {
        project_id: str("Project id from list_projects, or all."),
        title: str("Title."),
        body: str("The message."),
        priority: {
          type: "string",
          enum: ["Info", "Important", "Safety alert"],
        },
      },
      required: ["project_id", "title", "body", "priority"],
    },
  },
  {
    name: "sign_on_worker",
    write: true,
    description:
      "Sign a worker on at a project gate. Refused if they are not inducted to the project or have an expired ticket.",
    input_schema: {
      type: "object",
      properties: { project_id: pid, worker_id: str("Id from list_workers.") },
      required: ["project_id", "worker_id"],
    },
  },
  {
    name: "sign_off_worker",
    write: true,
    description: "Sign a worker off at a project gate.",
    input_schema: {
      type: "object",
      properties: { project_id: pid, worker_id: str("Id from list_workers.") },
      required: ["project_id", "worker_id"],
    },
  },
  {
    name: "add_programme_task",
    write: true,
    description: "Add a task to the project programme.",
    input_schema: {
      type: "object",
      properties: {
        project_id: pid,
        name: str("Task name."),
        trade: str("Trade, for example Concrete."),
        start: iso("Start date."),
        end: iso("Finish date."),
        needs_swms: {
          type: "boolean",
          description:
            "True for high risk work that needs a signed SWMS before it starts.",
        },
      },
      required: ["project_id", "name", "trade", "start", "end"],
    },
  },
  {
    name: "sign_in_visitor",
    write: true,
    description: "Sign a visitor in to a project.",
    input_schema: {
      type: "object",
      properties: {
        project_id: pid,
        name: str("Visitor's full name."),
        company: str("Their company."),
        purpose: str("Purpose of the visit."),
        host: str("Host on site."),
        inducted: {
          type: "boolean",
          description: "Whether they have had a visitor induction.",
        },
      },
      required: ["project_id", "name", "company", "purpose", "host"],
    },
  },
  {
    name: "request_permit",
    write: true,
    description:
      "Request a permit to work. It is created as Requested with its safety checks unticked. Only a person can tick the checks and approve it.",
    input_schema: {
      type: "object",
      properties: {
        project_id: pid,
        kind: {
          type: "string",
          enum: [
            "Hot work",
            "Confined space",
            "Excavation",
            "Working at height",
            "Electrical isolation",
            "Crane lift",
            "Demolition",
          ],
        },
        title: str("The work to be done."),
        location: str("Where."),
        issued_to: str("Person doing the work."),
        from: iso("Valid from."),
        until: iso("Valid until."),
      },
      required: [
        "project_id",
        "kind",
        "title",
        "location",
        "issued_to",
        "from",
        "until",
      ],
    },
  },
  {
    name: "start_inspection",
    write: true,
    description:
      "Start an inspection from a checklist. The checklist is created blank for a person to complete on site: you cannot record results.",
    input_schema: {
      type: "object",
      properties: {
        project_id: pid,
        kind: str(
          "Checklist name: Daily site walk, Scaffold inspection, Plant and equipment, Electrical and leads, Excavation, or a custom checklist name.",
        ),
        inspector: str("Who will carry it out."),
      },
      required: ["project_id", "kind", "inspector"],
    },
  },
];

export const toolByName = (n: string) => AGENT_TOOLS.find((t) => t.name === n);
