import Anthropic from "@anthropic-ai/sdk";

export const MODEL = process.env.AI_MODEL ?? "claude-sonnet-5-5";

/* ---------- light abuse protection: same-origin only, and a per-address rate limit ---------- */

const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 40;

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000)
    for (const [k, v] of hits)
      if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  return recent.length > MAX_HITS;
}

export const fail = (status: number, error: string, message: string) =>
  Response.json({ error, message }, { status });

/** Returns a Response to send back when the request should not run, or null when it may proceed. */
export function guard(req: Request): Response | null {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN)
    return fail(
      503,
      "not_configured",
      "The AI tools are not connected yet. Add ANTHROPIC_API_KEY to the server environment and restart.",
    );
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host)
    return fail(403, "forbidden", "Requests must come from this site.");
  const ip = (req.headers.get("x-forwarded-for") ?? "local")
    .split(",")[0]
    .trim();
  if (limited(ip))
    return fail(
      429,
      "rate_limited",
      "That is a lot of requests in a short time. Wait a few minutes and try again.",
    );
  return null;
}

export const client = () => new Anthropic();

export const apiError = (err: unknown) => {
  console.error(
    "ai error",
    err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err,
  );
  if (err instanceof Anthropic.RateLimitError)
    return fail(
      429,
      "busy",
      "The AI is busy right now. Try again in a moment.",
    );
  if (err instanceof Anthropic.AuthenticationError)
    return fail(
      502,
      "auth",
      "The AI key was rejected. Check ANTHROPIC_API_KEY.",
    );
  return fail(502, "error", "The AI could not finish that. Try again.");
};

/** Pulls the first JSON object out of a model reply, tolerating code fences and stray prose. */
export function parseJson(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(body.slice(start, end + 1));
  } catch {
    return null;
  }
}

/* ---------- small coercions so a odd reply can never break the UI ---------- */

export const str = (v: unknown, max = 2000) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
export const num = (v: unknown, lo: number, hi: number, d: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d;
};
export const pick = <T extends string>(v: unknown, list: readonly T[], d: T) =>
  list.find((x) => x.toLowerCase() === String(v ?? "").toLowerCase()) ?? d;
export const strs = (v: unknown, max = 12, each = 400) =>
  Array.isArray(v)
    ? v
        .map((x) => str(x, each))
        .filter(Boolean)
        .slice(0, max)
    : [];
export const isoDate = (v: unknown) => {
  const s = str(v, 20);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};
