"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/Icons";
import { useAiContext } from "@/components/app/ai";
import { useScope } from "@/components/app/DemoStore";
import { Markdown } from "@/components/app/Markdown";
import { Mascot } from "@/components/app/Mascot";
import { btnLight } from "@/components/app/ui";
import { toolByName } from "@/lib/agent-tools";
import { describeTool, executeTool, type AppStore, type Input } from "./agent";
import {
  isRunning,
  abortRun,
  readAskFirst,
  serverAsk,
  setCtrl,
  readChat,
  serverChat,
  serverRunning,
  setRunning,
  subscribeChat,
  writeAskFirst,
  writeChat,
  type ChatMessage,
  type Part,
  type ToolPart,
} from "./chatStore";
import { demoEvents } from "./demo";

const uid = () => Math.random().toString(36).slice(2, 10);
const MAX_STEPS = 12;

/* ---------- state that outlives this page, so a run keeps going if you click around ---------- */

let latestStore: AppStore | null = null;
let latestContext: () => string = () => "";
const approvals = new Map<string, (ok: boolean) => void>();

type Block = { type: string; [k: string]: unknown };
type Api = { role: "user" | "assistant"; content: string | Block[] };
export type StreamEvent =
  | { t: "text"; d: string }
  | { t: "final"; stop: string | null; content: Block[] }
  | { t: "error"; message: string };

function patchPart(id: string, patch: Partial<ToolPart>) {
  writeChat(
    readChat().map((m) => ({
      ...m,
      parts: m.parts.map((p) =>
        p.type === "tool" && p.id === id ? { ...p, ...patch } : p,
      ),
    })),
  );
}

function decide(id: string, ok: boolean) {
  const fn = approvals.get(id);
  if (!fn) return;
  approvals.delete(id);
  patchPart(id, { status: ok ? "running" : "declined" });
  fn(ok);
}

/** Earlier turns go back to the model as plain text plus a note of what was done. */
function flatten(msgs: ChatMessage[]): Api[] {
  return msgs.map((m) => {
    const text = m.parts
      .filter((p): p is Extract<Part, { type: "text" }> => p.type === "text")
      .map((p) => p.text)
      .join("\n\n")
      .trim();
    if (m.role === "user") return { role: "user", content: text || "(empty)" };
    const acts = m.parts
      .filter(
        (p): p is ToolPart =>
          p.type === "tool" && p.write && p.status === "done",
      )
      .map((p) => `${p.title}${p.detail ? `: ${p.detail}` : ""}`);
    const content =
      [
        text,
        acts.length ? `[Changes made in this reply: ${acts.join("; ")}]` : "",
      ]
        .filter(Boolean)
        .join("\n\n") || "(no reply)";
    return { role: "assistant", content };
  });
}

async function* readStream(res: Response): AsyncGenerator<StreamEvent> {
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line) continue;
      try {
        yield JSON.parse(line) as StreamEvent;
      } catch {
        // ignore a damaged line
      }
    }
  }
}

export function AssistantView() {
  const store = useScope();
  const context = useAiContext();
  const messages = useSyncExternalStore(subscribeChat, readChat, serverChat);
  const busy = useSyncExternalStore(subscribeChat, isRunning, serverRunning);
  const [input, setInput] = useState("");
  const askFirst = useSyncExternalStore(subscribeChat, readAskFirst, serverAsk);
  const [demo, setDemo] = useState(false);
  const [problem, setProblem] = useState<{ code: string; text: string } | null>(
    null,
  );
  const bottom = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    latestStore = store;
    latestContext = context;
  }, [store, context]);

  useEffect(() => {
    // anything still waiting or running when nothing is actually running was cut off
    if (!isRunning()) {
      const stale = readChat().some((m) =>
        m.parts.some(
          (p) =>
            p.type === "tool" &&
            (p.status === "pending" || p.status === "running"),
        ),
      );
      if (stale)
        writeChat(
          readChat().map((m) => ({
            ...m,
            parts: m.parts.map((p) =>
              p.type === "tool" &&
              (p.status === "pending" || p.status === "running")
                ? { ...p, status: "cancelled" as const }
                : p,
            ),
          })),
        );
    }
  }, []);

  useEffect(() => {
    if (messages.length) bottom.current?.scrollIntoView({ block: "end" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setProblem(null);
    setInput("");
    if (box.current) box.current.style.height = "auto";

    const ask = askFirst;
    const prior = flatten(readChat());
    const botId = uid();
    writeChat([
      ...readChat(),
      { id: uid(), role: "user", parts: [{ type: "text", text: q }] },
      { id: botId, role: "assistant", parts: [] },
    ]);
    const ctrl = new AbortController();
    setCtrl(ctrl);
    setRunning(true);

    const patchBot = (fn: (parts: Part[]) => Part[]) =>
      writeChat(
        readChat().map((m) =>
          m.id === botId ? { ...m, parts: fn(m.parts) } : m,
        ),
      );
    const addText = (d: string) =>
      patchBot((parts) => {
        const last = parts[parts.length - 1];
        return last && last.type === "text"
          ? [...parts.slice(0, -1), { type: "text", text: last.text + d }]
          : [...parts, { type: "text", text: d }];
      });
    const dropIfEmpty = () => {
      const bot = readChat().find((m) => m.id === botId);
      if (bot && bot.parts.length === 0)
        writeChat(readChat().filter((m) => m.id !== botId));
    };

    const api: Api[] = [...prior, { role: "user", content: q }];
    let useDemo = false;

    try {
      for (let step = 0; step < MAX_STEPS; step++) {
        let events: AsyncGenerator<StreamEvent> | AsyncIterable<StreamEvent>;
        if (useDemo) {
          events = demoEvents(step, latestStore!, ctrl.signal);
        } else {
          const res = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: ctrl.signal,
            body: JSON.stringify({
              messages: api,
              context: latestContext(),
            }),
          });
          if (!res.ok || !res.body) {
            const data = (await res.json().catch(() => ({}))) as {
              error?: string;
              message?: string;
            };
            if (data.error === "not_configured") {
              // not connected: show the same experience with a scripted run, using the real actions
              useDemo = true;
              setDemo(true);
              step = -1;
              continue;
            }
            dropIfEmpty();
            setProblem({
              code: data.error ?? "error",
              text:
                data.message ?? "The assistant could not answer. Try again.",
            });
            return;
          }
          events = readStream(res);
        }

        let final: Extract<StreamEvent, { t: "final" }> | null = null;
        for await (const ev of events) {
          if (ev.t === "text") addText(ev.d);
          else if (ev.t === "final") final = ev;
          else if (ev.t === "error") throw new Error(ev.message);
        }
        if (!final) throw new Error("The reply was cut off. Try again.");

        api.push({ role: "assistant", content: final.content });
        const uses = final.content.filter(
          (b): b is Block & { id: string; name: string; input: Input } =>
            b.type === "tool_use",
        );

        if (final.stop !== "tool_use" || !uses.length) {
          if (final.stop === "refusal")
            addText("\n\nI can't help with that request.");
          if (final.stop === "max_tokens")
            addText("\n\n(That reply was cut short. Ask me to continue.)");
          break;
        }

        const toolParts: ToolPart[] = uses.map((u) => {
          const d = describeTool(u.name, u.input, latestStore!);
          const write = !!toolByName(u.name)?.write;
          return {
            type: "tool",
            id: u.id,
            name: u.name,
            input: u.input,
            write,
            status: write && ask ? "pending" : "running",
            title: d.title,
            detail: d.detail,
          };
        });
        patchBot((parts) => [...parts, ...toolParts]);

        // every change in the batch can be approved or skipped straight away, in any order
        const decisions = new Map<string, Promise<boolean>>();
        for (const part of toolParts)
          if (part.status === "pending")
            decisions.set(
              part.id,
              new Promise<boolean>((resolve) => {
                approvals.set(part.id, resolve);
                ctrl.signal.addEventListener("abort", () => {
                  approvals.delete(part.id);
                  resolve(false);
                });
              }),
            );

        const results: Block[] = [];
        for (const part of toolParts) {
          if (ctrl.signal.aborted) {
            patchPart(part.id, { status: "cancelled" });
            results.push({
              type: "tool_result",
              tool_use_id: part.id,
              content: "Cancelled by the user.",
              is_error: true,
            });
            continue;
          }
          if (part.status === "pending") {
            const ok = await decisions.get(part.id)!;
            if (!ok) {
              if (ctrl.signal.aborted)
                patchPart(part.id, { status: "cancelled" });
              results.push({
                type: "tool_result",
                tool_use_id: part.id,
                content: ctrl.signal.aborted
                  ? "Cancelled by the user."
                  : "The user declined this action. Do not retry it. Ask what they would prefer.",
                is_error: true,
              });
              continue;
            }
          }
          const out = await executeTool(part.name, part.input, latestStore!);
          patchPart(part.id, {
            status: out.ok ? "done" : "error",
            outcome: out.outcome ?? (out.ok ? undefined : out.text),
            link: out.link,
          });
          results.push({
            type: "tool_result",
            tool_use_id: part.id,
            content: out.text,
            ...(out.ok ? {} : { is_error: true }),
          });
        }
        api.push({ role: "user", content: results });
        if (ctrl.signal.aborted) break;
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        dropIfEmpty();
        setProblem({
          code: "error",
          text:
            err instanceof TypeError
              ? "Could not reach the assistant. Check your connection and try again."
              : (err as Error).message || "Something went wrong. Try again.",
        });
      }
    } finally {
      // never leave a step spinning
      writeChat(
        readChat().map((m) =>
          m.id !== botId
            ? m
            : {
                ...m,
                parts: m.parts.map((p) =>
                  p.type === "tool" &&
                  (p.status === "running" || p.status === "pending")
                    ? { ...p, status: "cancelled" as const }
                    : p,
                ),
              },
        ),
      );
      approvals.clear();
      setCtrl(null);
      setRunning(false);
    }
  };

  const stop = () => abortRun();
  const reset = () => {
    abortRun();
    writeChat([]);
    setProblem(null);
    setDemo(false);
    box.current?.focus();
  };
  const toggleAsk = () => {
    writeAskFirst(!askFirst);
  };

  const empty = messages.length === 0;
  const last = messages[messages.length - 1];
  const waiting =
    last?.role === "assistant"
      ? last.parts.filter(
          (p): p is ToolPart => p.type === "tool" && p.status === "pending",
        )
      : [];

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-11rem)] max-w-3xl flex-col">
      {!empty && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="truncate rounded-full bg-tint px-3 py-1 text-[11px] font-semibold text-ink-soft">
              Reading {store.all ? "every project" : store.scopeLabel}
            </span>
            {demo && (
              <span className="rounded-full bg-accent/20 px-3 py-1 text-[11px] font-semibold">
                Demo mode: scripted, the AI is not connected
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={reset}
            className={`${btnLight} shrink-0`}
          >
            <Icon name="plus" className="h-4 w-4" /> New chat
          </button>
        </div>
      )}

      <div className="flex-1 space-y-7 pb-6">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-lg bg-ink px-4 py-3 text-[15px] leading-relaxed text-bg shadow-sm">
                {m.parts[0]?.type === "text" ? m.parts[0].text : ""}
              </p>
            </div>
          ) : (
            <Reply
              key={m.id}
              parts={m.parts}
              working={busy && i === messages.length - 1}
            />
          ),
        )}

        {waiting.length > 1 && (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
            <span className="font-semibold">
              {waiting.length} changes are waiting for you.
            </span>
            <span className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => waiting.forEach((p) => decide(p.id, true))}
                className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-bg hover:bg-ink/85"
              >
                Approve all
              </button>
              <button
                type="button"
                onClick={() => waiting.forEach((p) => decide(p.id, false))}
                className="rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold hover:bg-tint"
              >
                Skip all
              </button>
            </span>
          </div>
        )}

        {problem && (
          <div
            role="alert"
            className="rounded-2xl border border-accent/50 bg-accent/10 px-4 py-3.5 text-sm"
          >
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-1 text-ink-soft">{problem.text}</p>
          </div>
        )}
        <div ref={bottom} />
      </div>

      <div className="sticky bottom-0 -mx-4 bg-gradient-to-t from-bg from-70% to-transparent px-4 pb-4 pt-2 sm:-mx-8 sm:px-8">
        <div className="flex items-end gap-3">
          <Mascot
            className={`mascot-bob hidden h-24 w-24 shrink-0 sm:block ${busy ? "opacity-90" : ""}`}
          />
          <div className="min-w-0 flex-1">
            {empty && (
              <div className="mb-3 flex items-end gap-3">
                <Mascot className="mascot-bob h-20 w-20 shrink-0 sm:hidden" />
                <div className="relative max-w-md rounded-3xl rounded-bl-lg bg-ink px-5 py-3 text-bg shadow-lg">
                  <p className="font-display text-lg font-extrabold leading-snug">
                    G&apos;day. What are we sorting out today?
                  </p>
                  <p className="mt-1 text-sm text-bg/75">
                    Ask about WHS, or tell me what to get done across your
                    sites. I make the changes. You approve each one.
                  </p>
                </div>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="flex items-end gap-2 rounded-[1.75rem] border border-line bg-surface p-2 shadow-[0_12px_40px_-16px_oklch(0.23_0.02_255/0.35)] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30"
            >
              <label className="min-w-0 flex-1">
                <span className="sr-only">Ask or instruct the assistant</span>
                <textarea
                  ref={box}
                  value={input}
                  rows={1}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(input);
                    }
                  }}
                  placeholder="Ask, or tell me what to do"
                  className="max-h-44 w-full resize-none bg-transparent px-3 py-2.5 text-[15px] text-ink outline-none placeholder:text-ink-soft"
                />
              </label>
              {busy ? (
                <button
                  type="button"
                  onClick={stop}
                  aria-label="Stop"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-bg"
                >
                  <span className="h-3 w-3 rounded-sm bg-bg" />
                </button>
              ) : (
                <button
                  type="submit"
                  aria-label="Send"
                  disabled={!input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-ink transition-opacity disabled:opacity-30"
                >
                  <Icon name="arrow" className="h-4 w-4 -rotate-90" />
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-1">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-ink-soft">
            <button
              type="button"
              role="switch"
              aria-checked={askFirst}
              onClick={toggleAsk}
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                askFirst ? "bg-accent" : "bg-line"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                  askFirst ? "left-[1.1rem]" : "left-0.5"
                }`}
              />
            </button>
            Ask before making changes
          </label>
          <p className="text-[11px] text-ink-soft">
            Can make mistakes. General information, not legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Reply({ parts, working }: { parts: Part[]; working: boolean }) {
  // text and steps stay in the order they happened
  const groups: { kind: "text" | "steps"; items: Part[] }[] = [];
  for (const p of parts) {
    const kind = p.type === "text" ? "text" : "steps";
    const g = groups[groups.length - 1];
    if (g && g.kind === kind) g.items.push(p);
    else groups.push({ kind, items: [p] });
  }
  const idle =
    working &&
    !parts.some(
      (p) =>
        p.type === "tool" && (p.status === "running" || p.status === "pending"),
    );

  return (
    <div className="space-y-4">
      {groups.map((g, i) =>
        g.kind === "text" ? (
          <Markdown
            key={i}
            text={g.items
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("")}
          />
        ) : (
          <ol key={i} className="space-y-2">
            {g.items.map(
              (p) => p.type === "tool" && <Step key={p.id} part={p} />,
            )}
          </ol>
        ),
      )}
      {idle && (
        <div
          className="inline-flex items-center gap-1.5 py-1"
          role="status"
          aria-label="Working"
        >
          {[0, 150, 300].map((d) => (
            <span
              key={d}
              className="h-2 w-2 animate-bounce rounded-full bg-accent"
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: ToolPart["status"] }) {
  if (status === "running")
    return (
      <span
        className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-accent/30 border-t-accent"
        aria-label="Working"
      />
    );
  const cls =
    status === "done"
      ? "bg-emerald-500 text-white"
      : status === "pending"
        ? "bg-accent text-white"
        : "bg-line text-ink-soft";
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${cls}`}
      aria-hidden="true"
    >
      {status === "done" ? (
        <Icon name="check" className="h-2.5 w-2.5" />
      ) : status === "pending" ? (
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
      ) : (
        <Icon name="close" className="h-2.5 w-2.5" />
      )}
    </span>
  );
}

const STATUS_LABEL: Record<ToolPart["status"], string> = {
  pending: "Waiting for your approval",
  running: "Working",
  done: "Done",
  declined: "Skipped",
  error: "Could not do this",
  cancelled: "Stopped",
};

function Step({ part }: { part: ToolPart }) {
  // looking something up: a quiet one-line step
  if (!part.write)
    return (
      <li className="flex items-center gap-2.5 text-[13px] text-ink-soft">
        <StatusDot status={part.status} />
        <span className="min-w-0">
          {part.title}
          {part.detail && (
            <span className="text-ink-soft/70"> · {part.detail}</span>
          )}
        </span>
        {part.link && part.status === "done" && (
          <Link
            href={part.link.path}
            className="ml-1 shrink-0 font-semibold text-accent underline-offset-2 hover:underline"
          >
            {part.link.label}
          </Link>
        )}
      </li>
    );

  // a change: a card with what will happen, and the choice when approval is needed
  const pending = part.status === "pending";
  return (
    <li
      className={`rounded-2xl border px-4 py-3 ${
        pending
          ? "border-accent/60 bg-accent/[0.07]"
          : part.status === "error"
            ? "border-red-300/60 bg-red-50/60"
            : "border-line bg-surface"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-1">
          <StatusDot status={part.status} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug">{part.title}</p>
          {part.detail && (
            <p className="mt-0.5 break-words text-[13px] leading-snug text-ink-soft">
              {part.detail}
            </p>
          )}
          {!pending && (
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
              <span
                className={
                  part.status === "done"
                    ? "font-semibold text-emerald-700"
                    : part.status === "error"
                      ? "font-semibold text-red-700"
                      : "font-semibold"
                }
              >
                {part.status === "done" && part.outcome
                  ? part.outcome
                  : part.status === "error" && part.outcome
                    ? part.outcome
                    : STATUS_LABEL[part.status]}
              </span>
              {part.link && part.status === "done" && (
                <Link
                  href={part.link.path}
                  className="font-semibold text-accent underline-offset-2 hover:underline"
                >
                  {part.link.label}
                </Link>
              )}
            </p>
          )}
          {pending && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => decide(part.id, true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-bg hover:bg-ink/85"
              >
                <Icon name="check" className="h-3.5 w-3.5" /> Approve
              </button>
              <button
                type="button"
                onClick={() => decide(part.id, false)}
                className="rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold hover:bg-tint"
              >
                Skip
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
