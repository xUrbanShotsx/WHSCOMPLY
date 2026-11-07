export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** indexes of proposals the user has already confirmed */
  applied?: number[];
};

const KEY = "whscomply-assistant-v1";
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
