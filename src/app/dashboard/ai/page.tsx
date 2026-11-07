"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/Icons";
import { Sparkle } from "@/components/app/ai";
import { Card, PageHeading, Pill } from "@/components/app/ui";

type Tool = {
  name: string;
  body: string;
  where: string;
  href: string;
  icon: IconName;
};

const GROUPS: { label: string; blurb: string; tools: Tool[] }[] = [
  {
    label: "Capture",
    blurb: "Say it or photograph it on site. It becomes a proper record.",
    tools: [
      {
        name: "Incident capture",
        body: "Talk through what happened, or photograph handwritten notes. It fills in the type, severity, location and times, flags whether it may be notifiable, and suggests the first corrective actions.",
        where: "Incidents, Report incident",
        href: "/dashboard/incidents",
        icon: "alert",
      },
      {
        name: "Scan notes",
        body: "Photograph a handwritten site note and get it back as typed text, with anything unreadable marked.",
        where: "Report incident",
        href: "/dashboard/incidents",
        icon: "clip",
      },
      {
        name: "Ticket and licence scanner",
        body: "Photograph a white card or licence. It reads the type, number and expiry, and warns you if the name on it does not match the worker.",
        where: "Workers and tickets",
        href: "/dashboard/people",
        icon: "id",
      },
      {
        name: "Insurance certificate reader",
        body: "Upload a certificate of currency or workers' compensation certificate and it reads the cover type and expiry, checking the insured name against the subcontractor.",
        where: "Subcontractors",
        href: "/dashboard/subcontractors",
        icon: "store",
      },
    ],
  },
  {
    label: "Build",
    blurb: "Start from a description or an old form, not a blank page.",
    tools: [
      {
        name: "SWMS drafter",
        body: "Describe the job and get a full safe work method statement: the sequence of steps, the specific hazards and controls that follow the hierarchy of controls, and a risk rating for each.",
        where: "SWMS, New SWMS",
        href: "/dashboard/swms",
        icon: "file",
      },
      {
        name: "Risk assessor",
        body: "Type a hazard and get the category, before and after ratings on the 5 by 5 matrix and specific controls to put in the register.",
        where: "Risk register, Add risk",
        href: "/dashboard/risks",
        icon: "scale",
      },
      {
        name: "Checklist builder",
        body: "Upload a checklist, ITP or form as a photo or PDF, or paste it in. It becomes an inspection checklist you can start from, and you can edit every line.",
        where: "Inspections",
        href: "/dashboard/inspections",
        icon: "clipboard",
      },
      {
        name: "Toolbox talk writer",
        body: "Give it a topic and it writes a five minute talk with key points and questions, drawing on what has actually happened on your project recently.",
        where: "Toolbox talks, Consultation",
        href: "/dashboard/toolbox",
        icon: "users",
      },
    ],
  },
  {
    label: "Check",
    blurb: "A second pair of eyes before something goes wrong.",
    tools: [
      {
        name: "SWMS safety review",
        body: "Reviews a SWMS against what one must contain, flags missing hazards and weak controls such as relying on PPE, and gives the wording to fix each gap.",
        where: "Any SWMS",
        href: "/dashboard/swms",
        icon: "shield",
      },
      {
        name: "Hazard spotting from a photo",
        body: "Photograph a work area and it lists the hazards it can see with ratings and controls. Add any of them to the risk register in one click.",
        where: "Risk register",
        href: "/dashboard/risks",
        icon: "alert",
      },
      {
        name: "Incident investigation helper",
        body: "Suggests likely root causes from a systems view, drafts corrective actions with due dates you can add in one click, and notes whether the incident may be notifiable.",
        where: "Any open incident",
        href: "/dashboard/incidents",
        icon: "check",
      },
    ],
  },
  {
    label: "Report and ask",
    blurb: "The write-ups, and answers about your sites, without digging.",
    tools: [
      {
        name: "Assistant",
        body: "Ask about Australian WHS requirements or about your own sites. It reads your projects, SWMS, tickets, permits, plant and incidents, and can draft actions, incident reports, toolbox talks and risks for you to confirm.",
        where: "Assistant",
        href: "/dashboard/assistant",
        icon: "sparkle",
      },
      {
        name: "Weekly safety summary",
        body: "Writes a client-ready summary of the week from your records, ranked by what needs action. Edit it, copy it and send.",
        where: "Reports",
        href: "/dashboard/reports",
        icon: "list",
      },
      {
        name: "Text tools",
        body: "Tidy rough text, shorten it, turn it into bullets, or translate it into ten community languages, in any long text field.",
        where: "Incidents, toolbox talks",
        href: "/dashboard/toolbox",
        icon: "book",
      },
      {
        name: "Voice dictation",
        body: "Speak instead of typing in the Assistant, SWMS drafter and incident capture, in Australian English.",
        where: "Where you see Speak",
        href: "/dashboard/assistant",
        icon: "bell",
      },
    ],
  },
];

const FAQ: [string, string][] = [
  [
    "Is anything saved without me checking it?",
    "No. Every AI result is a draft you can edit. Nothing is saved to your records until you press the normal save button, and the Assistant only proposes changes that you confirm one by one.",
  ],
  [
    "What if the AI gets something wrong?",
    "It can. Check anything safety-critical against the real site and your own judgement. Notifiability and legal points are general guidance only: confirm with your state regulator.",
  ],
  [
    "What does it see?",
    "Only the project you have selected in the top bar, and only when you use an AI tool. Photos and text you submit are sent to the AI provider to produce the result.",
  ],
];

export default function AiToolkitPage() {
  const [on, setOn] = useState<boolean | null>(null);
  useEffect(() => {
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then((d: { configured: boolean }) => setOn(d.configured))
      .catch(() => setOn(false));
  }, []);

  return (
    <>
      <PageHeading
        title="AI toolkit"
        sub="Built into the modules you already use. It does the admin so your team spends its time on site."
        actions={
          on === null ? undefined : on ? (
            <Pill tone="ok">Connected</Pill>
          ) : (
            <Pill tone="owed">Not connected yet</Pill>
          )
        }
      />

      {on === false && (
        <p className="mb-6 rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          The AI tools are built but need a key to run. Add{" "}
          <code className="rounded bg-tint px-1 py-0.5 font-mono text-xs">
            ANTHROPIC_API_KEY
          </code>{" "}
          to the server environment and restart it.
        </p>
      )}

      <div className="space-y-10">
        {GROUPS.map((g) => (
          <section key={g.label}>
            <div className="mb-4">
              <h2 className="font-display text-xl font-extrabold tracking-tight">
                {g.label}
              </h2>
              <p className="text-sm text-ink-soft">{g.blurb}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {g.tools.map((t) => (
                <Link key={t.name} href={t.href} className="group block">
                  <Card className="h-full transition-colors group-hover:border-ink">
                    <div className="flex h-full flex-col p-5">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/25">
                          <Icon name={t.icon} className="h-[18px] w-[18px]" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="flex items-center gap-1.5 font-display text-lg font-extrabold leading-tight">
                            {t.name}{" "}
                            <Sparkle className="h-3.5 w-3.5 text-ink-soft" />
                          </h3>
                          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                            {t.where}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-ink-soft">{t.body}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                        Open <Icon name="arrow" className="h-4 w-4" />
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-extrabold tracking-tight">
          Good to know
        </h2>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {q}
                <span className="font-mono text-lg transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 max-w-2xl text-sm text-ink-soft">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
