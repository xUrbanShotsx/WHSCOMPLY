export type ToolStatus =
  | "pending" // waiting for the user to approve
  | "running"
  | "done"
  | "declined"
  | "error"
  | "cancelled";

export type ToolPart = {
  type: "tool";
  id: string;
  name: string;
  input: Record<string, unknown>;
  write: boolean;
  status: ToolStatus;
  /** What the step is, in words: "Looking up properties", "Create task". */
  title: string;
  /** The specifics, shown on approval cards and under finished steps. */
  detail?: string;
  /** Plain outcome shown after it ran. */
  outcome?: string;
  link?: { path: string; label: string };
};

export type Part = { type: "text"; text: string } | ToolPart;

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  parts: Part[];
};

const KEY = "whscomply-assistant-v2";
const listeners = new Set<() => void>();
let cacheRaw: string | null | undefined;
let cacheVal: ChatMessage[] = [];
const EMPTY: ChatMessage[] = [];

/** The conversation lives in this browser so it survives navigating around the dashboard. */
export function readChat(): ChatMessage[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return cacheVal;
  }
  if (raw === cacheRaw) return cacheVal;
  cacheRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as ChatMessage[]) : EMPTY;
    cacheVal = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    cacheVal = EMPTY;
  }
  return cacheVal;
}

export function writeChat(next: ChatMessage[]) {
  const capped = next.slice(-60);
  cacheVal = capped;
  try {
    const raw = JSON.stringify(capped);
    localStorage.setItem(KEY, raw);
    cacheRaw = raw;
  } catch {
    cacheRaw = undefined;
  }
  listeners.forEach((l) => l());
}

export function subscribeChat(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export const serverChat = () => EMPTY;

/** Whether the assistant must ask before it changes anything. On unless the user turns it off. */
const ASK_KEY = "whscomply-assistant-ask";
export function readAskFirst(): boolean {
  try {
    return localStorage.getItem(ASK_KEY) !== "off";
  } catch {
    return true;
  }
}
export function writeAskFirst(on: boolean) {
  try {
    localStorage.setItem(ASK_KEY, on ? "on" : "off");
  } catch {
    // fine: it just will not be remembered
  }
  listeners.forEach((l) => l());
}
export const serverAsk = () => true;

/** The controller of the run in progress, so Stop works from any page instance. */
let ctrl: AbortController | null = null;
export const setCtrl = (c: AbortController | null) => {
  ctrl = c;
};
export const abortRun = () => ctrl?.abort();

/** Whether an agent run is in progress. Kept outside the page so it survives moving around the dashboard. */
let running = false;
export const isRunning = () => running;
export const serverRunning = () => false;
export function setRunning(on: boolean) {
  running = on;
  listeners.forEach((l) => l());
}
