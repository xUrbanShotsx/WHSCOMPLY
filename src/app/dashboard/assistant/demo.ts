import { addDays, daysUntil, expiryOf } from "@/lib/data";
import { todayISO } from "@/lib/format";
import type { AppStore } from "./agent";
import type { StreamEvent } from "./AssistantView";

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((r) => {
    const t = setTimeout(r, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      r();
    });
  });

async function* say(
  text: string,
  signal: AbortSignal,
): AsyncGenerator<StreamEvent> {
  for (let i = 0; i < text.length; i += 5) {
    if (signal.aborted) return;
    yield { t: "text", d: text.slice(i, i + 5) };
    await wait(14, signal);
  }
}

/**
 * A scripted run used only while the AI is not connected. It performs a real sweep of the workspace, then
 * proposes real changes, so the whole look and feel can be seen. It does not read the question.
 */
export async function* demoEvents(
  step: number,
  store: AppStore,
  signal: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const today = todayISO();
  await wait(700, signal);

  if (step === 0) {
    const text =
      "I'll sweep the sites for anything that needs attention, starting with unsigned SWMS, tickets and overdue actions.\n\n";
    yield* say(text, signal);
    yield {
      t: "final",
      stop: "tool_use",
      content: [
        { type: "text", text },
        {
          type: "tool_use",
          id: "demo-0-a",
          name: "list_swms",
          input: { unsigned_only: true },
        },
        {
          type: "tool_use",
          id: "demo-0-b",
          name: "list_workers",
          input: { issues_only: true },
        },
        {
          type: "tool_use",
          id: "demo-0-c",
          name: "list_actions",
          input: { status: "Open" },
        },
      ],
    };
    return;
  }

  if (step === 1) {
    const unsigned = store.swms.filter(
      (x) =>
        x.status === "Active" && x.required.some((w) => !x.signed.includes(w)),
    );
    const issues = store.workers
      .map((w) => ({
        w,
        t: w.tickets.find((t) => {
          const e = expiryOf(t.expires, store.settings.warnDays);
          return e === "expired" || e === "soon";
        }),
      }))
      .filter((x) => x.t)
      .slice(0, 3);
    const overdue = store.actions.filter(
      (a) => a.status === "Open" && daysUntil(a.due) < 0,
    );
    const first = unsigned[0];

    const text = `Here is what I found: ${unsigned.length} active SWMS with signatures owed, ${issues.length} worker${issues.length === 1 ? "" : "s"} with a ticket that has expired or is about to, and ${overdue.length} overdue action${overdue.length === 1 ? "" : "s"}. ${
      first || issues.length
        ? "I'll post a safety alert for the crew, raise renewal actions, and put a toolbox talk in the diary. Approve the ones you want. I can't sign a SWMS for anyone, so the signatures themselves are still with the crew."
        : "Nothing needs action, so I'll just note the sweep in the site diary."
    }\n\n`;
    yield* say(text, signal);

    const uses: {
      type: string;
      id: string;
      name: string;
      input: Record<string, unknown>;
    }[] = [];
    if (first)
      uses.push({
        type: "tool_use",
        id: "demo-1-n",
        name: "post_notice",
        input: {
          project_id: first.projectId,
          title: `SWMS signatures needed: ${first.title}`,
          body: `Everyone assigned to "${first.title}" must read and sign the current version before the work starts. See your foreman.`,
          priority: "Safety alert",
        },
      });
    issues.forEach(({ w, t }, i) =>
      uses.push({
        type: "tool_use",
        id: `demo-1-a${i}`,
        name: "create_action",
        input: {
          project_id: w.projects[0] ?? store.projects[0]?.id,
          title: `Renew ${t!.kind} for ${w.name}`,
          owner: w.name,
          due: addDays(3, today),
        },
      }),
    );
    if (first)
      uses.push({
        type: "tool_use",
        id: "demo-1-t",
        name: "schedule_talk",
        input: {
          project_id: first.projectId,
          kind: "Toolbox talk",
          topic: "Reading and signing the SWMS before work starts",
          date: addDays(1, today),
          notes:
            "Why we sign on to the method statement, what to check, and who to tell if the steps do not match the job.",
        },
      });
    if (!uses.length)
      uses.push({
        type: "tool_use",
        id: "demo-1-d",
        name: "add_diary_entry",
        input: {
          project_id: store.projects[0]?.id,
          summary: "Safety sweep run: nothing needs action.",
          work_done:
            "Assistant reviewed SWMS, tickets and actions across the sites.",
        },
      });
    yield {
      t: "final",
      stop: "tool_use",
      content: [{ type: "text", text }, ...uses],
    };
    return;
  }

  const text =
    "That is the sweep done. Anything you approved is now in WHSCOMPLY, and anything you skipped is left as it was. Ask me to do the same for one project, or to look at permits, plant or incidents.";
  yield* say(text, signal);
  yield { t: "final", stop: "end_turn", content: [{ type: "text", text }] };
}
