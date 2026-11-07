import type { Proposal } from "@/lib/ai-types";

const FENCE = /```actions\s*([\s\S]*?)```/;

/** Splits a reply into the text to show and the changes it proposes. A half-streamed block is hidden. */
export function splitReply(content: string): {
  text: string;
  proposals: Proposal[];
} {
  const open = content.indexOf("```actions");
  if (open < 0) return { text: content.trim(), proposals: [] };
  const text = content.slice(0, open).trim();
  const m = FENCE.exec(content);
  if (!m) return { text, proposals: [] };
  try {
    const raw = JSON.parse(m[1]) as unknown;
    const list = Array.isArray(raw) ? raw : [];
    const ok = list.filter(
      (p): p is Proposal =>
        !!p &&
        typeof p === "object" &&
        [
          "create_action",
          "report_incident",
          "schedule_talk",
          "add_risk",
        ].includes((p as { type?: string }).type ?? ""),
    );
    return { text, proposals: ok.slice(0, 4) };
  } catch {
    return { text, proposals: [] };
  }
}
