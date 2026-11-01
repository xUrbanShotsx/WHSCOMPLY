export type Faq = { q: string; a: string };

export type Topic = {
  slug: string;
  nav: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  points: [string, string][];
  faqs: Faq[];
  related: string[];
};

export const topics: Topic[] = [
  {
    slug: "swms-software",
    nav: "SWMS software",
    title: "SWMS Software for Builders",
    h1: "SWMS software that every worker actually signs",
    description:
      "Build safe work method statements from a task library, push them to the crew and sign on at the gate. See who has not signed before high risk work starts.",
    intro:
      "A safe work method statement is only useful if the people doing the work have read it and signed it before they start. WHSCOMPLY turns the SWMS from a document in the site office into a live record tied to the site, the task and every worker.",
    points: [
      [
        "A task library you own",
        "Write each high risk task once, with its hazards and controls, then reuse it across projects instead of copying last job's Word file.",
      ],
      [
        "Sign-on from a phone or gate tablet",
        "Workers read and sign on the device they already carry. The foreman sees unsigned names before the pour, the lift or the scaffold alteration.",
      ],
      [
        "Version history",
        "When a SWMS changes mid-project, the old version is kept. You can show which version was live on which day and who had signed it.",
      ],
    ],
    faqs: [
      {
        q: "What is a SWMS in construction?",
        a: "A safe work method statement sets out the work steps, the hazards in each step and the controls that will be used. In Australia a SWMS is required for high risk construction work, and workers must be able to follow it on site.",
      },
      {
        q: "Can workers sign a SWMS on their phone?",
        a: "Yes. Workers read the SWMS and sign on a phone or a gate tablet. Each signature is time-stamped and kept against the site and the version.",
      },
    ],
    related: ["site-induction-software", "toolbox-talk-software", "audit-pack"],
  },
  {
    slug: "site-induction-software",
    nav: "Site induction software",
    title: "Site Induction Software for Construction",
    h1: "Site inductions done once per project, proven forever",
    description:
      "Digital site inductions for builders. Workers induct once per project, sign on at the gate, and the record is kept for audit.",
    intro:
      "Every worker who arrives on a site needs to be inducted to it. WHSCOMPLY replaces the clipboard and the sign-in sheet with an induction the worker completes on their phone, recorded against the project and the person.",
    points: [
      [
        "Project-specific content",
        "Show site rules, emergency points, exclusion zones and contacts for this project, not a generic slide deck.",
      ],
      [
        "Sign on and off",
        "Know who is on site right now, which matters for emergencies and for the daily record.",
      ],
      [
        "Evidence you can export",
        "Each induction is time-stamped and stored with the worker's details, ready for a client or inspector request.",
      ],
    ],
    faqs: [
      {
        q: "Is a site induction the same as a white card?",
        a: "No. The general construction induction card (white card) shows a worker has completed general training. A site induction covers the specific hazards, rules and emergency arrangements of one project.",
      },
      {
        q: "Who has to be inducted on a construction site?",
        a: "Anyone who works on or enters the site, including subcontractors and visitors, should be inducted for the site in a way that matches the risk of where they will be.",
      },
    ],
    related: [
      "white-card-licence-tracking",
      "swms-software",
      "subcontractor-prequalification",
    ],
  },
  {
    slug: "white-card-licence-tracking",
    nav: "White card and licence tracking",
    title: "White Card and High Risk Work Licence Tracking",
    h1: "White cards and licences, checked before anyone starts",
    description:
      "Track general construction induction cards, high risk work licences and tickets for every worker, with alerts before they expire.",
    intro:
      "Cards and licences live in wallets, glove boxes and phone photos. WHSCOMPLY keeps each worker's tickets on file, shows what is valid and flags what is about to lapse so it never surfaces for the first time in an audit.",
    points: [
      [
        "One record per worker",
        "General induction cards, high risk work licences and trade tickets sit on the worker's profile, not scattered across projects.",
      ],
      [
        "Expiry alerts",
        "Site managers and workers are warned weeks before a licence expires, early enough to book a renewal.",
      ],
      [
        "Block sign-on when lapsed",
        "A worker without a valid ticket for their task is flagged at sign-on rather than discovered after the work is done.",
      ],
    ],
    faqs: [
      {
        q: "What is a white card?",
        a: "A white card is the common name for the general construction induction card, which shows a worker has completed general WHS training for construction work in Australia.",
      },
      {
        q: "Which licences should builders track?",
        a: "Track high risk work licences such as crane, scaffolding, dogging, rigging and elevating work platform licences, plus any trade licences and the white card for every worker.",
      },
    ],
    related: [
      "site-induction-software",
      "subcontractor-prequalification",
      "audit-pack",
    ],
  },
  {
    slug: "subcontractor-prequalification",
    nav: "Subcontractor prequalification",
    title: "Subcontractor Prequalification Software",
    h1: "Prequalify subcontractors before they reach the gate",
    description:
      "Collect and check subcontractor insurances, licences, SWMS and safety records before they start work, and keep them current for the life of the project.",
    intro:
      "As the principal contractor you are answerable for who you let onto the site. WHSCOMPLY collects each subcontractor's paperwork up front, checks it against your requirements and keeps watching the expiry dates.",
    points: [
      [
        "A prequalification pack",
        "Ask for insurances, licences, safety policies and sample SWMS in one request instead of a chain of emails.",
      ],
      [
        "Insurance and WorkCover dates",
        "Policy expiries are tracked, and the subcontractor is reminded directly before they lapse.",
      ],
      [
        "Approved list per project",
        "Only subcontractors whose paperwork is current appear on the approved list for a site.",
      ],
    ],
    faqs: [
      {
        q: "What should a builder check before a subcontractor starts?",
        a: "Check their licences, insurances, workers' compensation cover, safety documentation such as SWMS, and the tickets of the workers they will send.",
      },
      {
        q: "How often should subcontractor documents be reviewed?",
        a: "Whenever a document expires, and whenever the scope of their work changes. Tracking expiry dates in software means you are alerted rather than relying on memory.",
      },
    ],
    related: ["white-card-licence-tracking", "swms-software", "audit-pack"],
  },
  {
    slug: "incident-reporting-software",
    nav: "Incident reporting",
    title: "Incident and Near Miss Reporting Software",
    h1: "Incident reports closed out properly, not left in the ute",
    description:
      "Report incidents, near misses and hazards from any phone, follow the same steps every time and track corrective actions until they are done.",
    intro:
      "The first hour after an incident decides how good the record will be. WHSCOMPLY lets anyone report from site with photos, then walks the site manager through the same steps every time, including whether the incident needs to be notified to the regulator.",
    points: [
      [
        "Report in under a minute",
        "Photos, location, people involved and a short description, from a phone, with no login hunt.",
      ],
      [
        "A consistent process",
        "Make safe, record, assess notifiability, investigate and close out, in the same order on every project.",
      ],
      [
        "Corrective actions that finish",
        "Each action has an owner and a due date, and stays open on the board until it is done.",
      ],
    ],
    faqs: [
      {
        q: "What is a notifiable incident?",
        a: "A notifiable incident is a serious event, such as a death, a serious injury or illness or a dangerous incident, that must be reported to the WHS regulator. The rules are set by each state and territory regulator, so check yours.",
      },
      {
        q: "Should near misses be reported?",
        a: "Yes. Near misses show hazards before someone is hurt. Making them easy to report is the quickest way to find and fix them.",
      },
    ],
    related: [
      "site-inspection-checklists",
      "audit-pack",
      "toolbox-talk-software",
    ],
  },
  {
    slug: "site-inspection-checklists",
    nav: "Site inspection checklists",
    title: "Construction Site Inspection Checklists",
    h1: "Daily and weekly site inspections that leave a record",
    description:
      "Digital inspection checklists for scaffolds, plant, electrical, housekeeping and daily site walks, with photos and corrective actions.",
    intro:
      "A walk of the site that is never written down did not happen as far as an auditor is concerned. WHSCOMPLY turns each inspection into a checklist with answers, photos and follow-up actions.",
    points: [
      [
        "Checklists for your work",
        "Scaffold, plant, excavation, electrical and daily site walk templates you can change to match how you build.",
      ],
      [
        "Fail means action",
        "A failed item creates a corrective action with an owner, so nothing is noted and forgotten.",
      ],
      [
        "Trends over time",
        "See which hazards keep coming back on which sites, and fix the cause.",
      ],
    ],
    faqs: [
      {
        q: "How often should construction sites be inspected?",
        a: "It depends on the risk. Many builders do a daily site walk and scheduled weekly inspections of scaffolds, plant and electrical equipment, with extra checks after weather or changes.",
      },
      {
        q: "Can inspections include photos?",
        a: "Yes. Attach photos to any item, which makes failed items clearer and gives you evidence once they are fixed.",
      },
    ],
    related: [
      "incident-reporting-software",
      "toolbox-talk-software",
      "audit-pack",
    ],
  },
  {
    slug: "toolbox-talk-software",
    nav: "Toolbox talks",
    title: "Toolbox Talk Software for Builders",
    h1: "Toolbox talks with attendance you can prove",
    description:
      "Run toolbox talks from templates and record who attended. Keep topics, dates and signatures for every site.",
    intro:
      "Toolbox talks work when they happen and when you can show they did. WHSCOMPLY gives the foreman a topic, collects signatures on the spot and files the record against the site.",
    points: [
      [
        "Ready topics",
        "Pick from common construction topics or write your own, so each talk takes minutes to set up.",
      ],
      [
        "Attendance by signature",
        "Workers sign on their phone or one tablet passed around the group.",
      ],
      [
        "Linked to the work",
        "Connect a talk to the SWMS or incident that prompted it.",
      ],
    ],
    faqs: [
      {
        q: "What is a toolbox talk?",
        a: "A toolbox talk is a short safety briefing held on site, usually before work starts, on a topic relevant to the day's tasks or a recent incident.",
      },
      {
        q: "Do toolbox talks need to be recorded?",
        a: "Recording the topic, date and attendees gives you evidence that consultation and briefing took place. It is simple to do digitally.",
      },
    ],
    related: [
      "swms-software",
      "incident-reporting-software",
      "site-inspection-checklists",
    ],
  },
  {
    slug: "audit-pack",
    nav: "WHS audit pack",
    title: "WHS Audit Pack for Construction",
    h1: "The WHS audit pack that is already built",
    description:
      "Export a time-stamped WHS record for any site and date range, or give an inspector read-only access. Records are never hard-deleted.",
    intro:
      "When an inspector, a client or an insurer asks for evidence, the answer should be an export, not a week of digging through folders. Every sign-on, signature and report in WHSCOMPLY is time-stamped and kept with who did it.",
    points: [
      [
        "Export by site and date",
        "Choose a project and a period and get SWMS, inductions, tickets, inspections and incidents in one pack.",
      ],
      [
        "A full audit log",
        "Every change records who, what and when, with the previous value.",
      ],
      [
        "Read-only access",
        "Give an inspector or client their own view instead of emailing attachments.",
      ],
    ],
    faqs: [
      {
        q: "What does a WHS audit look for in construction?",
        a: "Auditors look for evidence that risks were identified and controlled: SWMS, inductions, licences, inspections, consultation and how incidents were handled.",
      },
      {
        q: "Are records ever deleted?",
        a: "No. Compliance records are not hard-deleted, so the history stays intact for the period you need to keep it.",
      },
    ],
    related: [
      "swms-software",
      "white-card-licence-tracking",
      "incident-reporting-software",
    ],
  },
];

export const topicBySlug = (slug: string) =>
  topics.find((t) => t.slug === slug);

export type State = {
  slug: string;
  code: string;
  name: string;
  regulator: string;
  act: string;
  cities: string[];
  note: string;
};

export const states: State[] = [
  {
    slug: "nsw",
    code: "NSW",
    name: "New South Wales",
    regulator: "SafeWork NSW",
    act: "Work Health and Safety Act 2011 (NSW)",
    cities: ["Sydney", "Newcastle", "Wollongong", "Central Coast"],
    note: "NSW builders work under the model WHS laws, regulated by SafeWork NSW.",
  },
  {
    slug: "vic",
    code: "VIC",
    name: "Victoria",
    regulator: "WorkSafe Victoria",
    act: "Occupational Health and Safety Act 2004 (Vic)",
    cities: ["Melbourne", "Geelong", "Ballarat", "Bendigo"],
    note: "Victoria has not adopted the model WHS laws. Its duties come from the OHS Act 2004, regulated by WorkSafe Victoria.",
  },
  {
    slug: "qld",
    code: "QLD",
    name: "Queensland",
    regulator: "WorkSafe Queensland",
    act: "Work Health and Safety Act 2011 (Qld)",
    cities: ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville"],
    note: "Queensland builders work under the model WHS laws, regulated by WorkSafe Queensland.",
  },
  {
    slug: "wa",
    code: "WA",
    name: "Western Australia",
    regulator: "WorkSafe WA",
    act: "Work Health and Safety Act 2020 (WA)",
    cities: ["Perth", "Mandurah", "Bunbury", "Geraldton"],
    note: "Western Australia moved to its own WHS Act in 2022, regulated by WorkSafe WA.",
  },
  {
    slug: "sa",
    code: "SA",
    name: "South Australia",
    regulator: "SafeWork SA",
    act: "Work Health and Safety Act 2012 (SA)",
    cities: ["Adelaide", "Mount Gambier", "Whyalla", "Murray Bridge"],
    note: "South Australian builders work under the model WHS laws, regulated by SafeWork SA.",
  },
  {
    slug: "tas",
    code: "TAS",
    name: "Tasmania",
    regulator: "WorkSafe Tasmania",
    act: "Work Health and Safety Act 2012 (Tas)",
    cities: ["Hobart", "Launceston", "Devonport", "Burnie"],
    note: "Tasmanian builders work under the model WHS laws, regulated by WorkSafe Tasmania.",
  },
  {
    slug: "act",
    code: "ACT",
    name: "Australian Capital Territory",
    regulator: "WorkSafe ACT",
    act: "Work Health and Safety Act 2011 (ACT)",
    cities: ["Canberra", "Queanbeyan region", "Belconnen", "Tuggeranong"],
    note: "ACT builders work under the model WHS laws, regulated by WorkSafe ACT.",
  },
  {
    slug: "nt",
    code: "NT",
    name: "Northern Territory",
    regulator: "NT WorkSafe",
    act: "Work Health and Safety (National Uniform Legislation) Act 2011 (NT)",
    cities: ["Darwin", "Palmerston", "Alice Springs", "Katherine"],
    note: "Northern Territory builders work under the model WHS laws, regulated by NT WorkSafe.",
  },
];

export const stateBySlug = (slug: string) =>
  states.find((s) => s.slug === slug);

export const homeFaqs: Faq[] = [
  {
    q: "What is WHSCOMPLY?",
    a: "WHSCOMPLY is WHS compliance software for Australian builders. It manages SWMS, site inductions, white cards and licences, subcontractor prequalification, inspections and incidents in one place, and produces an audit pack on demand.",
  },
  {
    q: "Who is WHSCOMPLY for?",
    a: "Builders, principal contractors and subcontractors who need to show they meet their work health and safety duties on construction sites.",
  },
  {
    q: "Does WHSCOMPLY work in every Australian state?",
    a: "Yes. Workers and site managers use it on any project in Australia. Each state and territory has its own regulator, and the software lets you keep records for whichever applies to the site.",
  },
  {
    q: "Can workers use it on their phones?",
    a: "Yes. Workers sign on, sign SWMS and report incidents from a phone or a gate tablet, with no paper.",
  },
  {
    q: "Does it replace legal advice?",
    a: "No. WHSCOMPLY helps you keep and show records. It is not legal advice, so check your obligations with your regulator or a WHS adviser.",
  },
  {
    q: "How is WHSCOMPLY priced?",
    a: "Pricing is by project, not per worker. Book a demo and we will quote you based on how many sites you run.",
  },
];
