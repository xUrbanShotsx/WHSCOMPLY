"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/Icons";
import { useAiContext, VoiceButton } from "@/components/app/ai";
import { useScope } from "@/components/app/DemoStore";
import { Markdown } from "@/components/app/Markdown";
import { btnDark, btnLight, Pill } from "@/components/app/ui";
import type { Proposal } from "@/lib/ai-types";
import {
  addDays,
  me,
  RISK_CATEGORIES,
  type IncidentType,
  type RiskLevel,
} from "@/lib/data";
import { SUGGESTIONS } from "@/lib/ai-context";
import { todayISO } from "@/lib/format";
import {
  readChat,
  serverChat,
  subscribeChat,
  writeChat,
  type ChatMessage,
} from "./chatStore";
import { splitReply } from "./proposals";

const uid = () => Math.random().toString(36).slice(2, 10);

const TYPES = [
  "Near miss",
  "Hazard",
  "First aid",
  "Injury",
  "Property damage",
  "Dangerous incident",
];
const LEVELS = ["Low", "Medium", "High", "Extreme"];
const near = (v: string, list: string[], d: string) =>
  list.find((x) => x.toLowerCase() === v.toLowerCase()) ?? d;
const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, Math.round(Number(n) || lo)));

export function AssistantView() {
  const s = useScope();
  const context = useAiContext();
  const messages = useSyncExternalStore(subscribeChat, readChat, serverChat);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<{ code: string; text: string } | null>(
    null,
  );
  const abort = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setProblem(null);
    setInput("");
    const history: ChatMessage[] = [
      ...readChat(),
      { id: uid(), role: "user", content: q },
    ];
    const reply: ChatMessage = { id: uid(), role: "assistant", content: "" };
    writeChat([...history, reply]);
    setBusy(true);
    const ctrl = new AbortController();
    abort.current = ctrl;
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          context: context(),
        }),
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        writeChat(history);
        setProblem({
          code: data.error ?? "error",
          text: data.message ?? "The assistant could not answer. Try again.",
        });
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        writeChat([...history, { ...reply, content: acc }]);
      }
      if (!acc.trim())
        writeChat([
          ...history,
          {
            ...reply,
            content: "I did not get an answer back. Try asking again.",
          },
        ]);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      writeChat(history);
      setProblem({
        code: "network",
        text: "Could not reach the assistant. Check your connection and try again.",
      });
    } finally {
      setBusy(false);
      abort.current = null;
    }
  };

  const reset = () => {
    abort.current?.abort();
    writeChat([]);
    setProblem(null);
    setBusy(false);
    box.current?.focus();
  };

  const projectId = (name: string) => {
    const n = name.trim().toLowerCase();
    return (
      s.projects.find((p) => p.name.toLowerCase() === n)?.id ??
      s.projects.find(
        (p) =>
          n &&
          (p.name.toLowerCase().includes(n) ||
            n.includes(p.name.toLowerCase())),
      )?.id ??
      (s.all ? s.projects[0]?.id : s.scopeId) ??
      ""
    );
  };

  const apply = (msg: ChatMessage, i: number, p: Proposal) => {
    const pid = projectId(p.project);
    if (!pid) return;
    if (p.type === "create_action")
      s.addAction({
        projectId: pid,
        title: p.title,
        source: "Manual",
        sourceLabel: "Proposed by the Assistant",
        owner: p.owner || me.name,
        due: addDays(clamp(p.days, 0, 180)),
      });
    else if (p.type === "report_incident")
      s.reportIncident({
        projectId: pid,
        type: near(p.incidentType, TYPES, "Near miss") as IncidentType,
        title: p.title,
        date: todayISO(),
        time: new Date().toTimeString().slice(0, 5),
        location: p.location || "Not stated",
        reporter: me.name,
        people: "",
        description: p.description,
        severity: near(p.severity, LEVELS, "Medium") as RiskLevel,
      });
    else if (p.type === "schedule_talk")
      s.addTalk({
        projectId: pid,
        topic: p.topic,
        date: addDays(clamp(p.days, 0, 60)),
        presenter: me.name,
        notes: p.notes,
      });
    else {
      const l = clamp(p.likelihood, 1, 5);
      const c = clamp(p.consequence, 1, 5);
      s.addRisk({
        projectId: pid,
        hazard: p.hazard,
        category: near(p.category, RISK_CATEGORIES, "Other"),
        likelihood: l,
        consequence: c,
        controls: p.controls,
        resL: Math.max(1, l - 1),
        resC: c,
        owner: me.name,
        review: addDays(30),
        status: "Open",
      });
    }
    writeChat(
      readChat().map((m) =>
        m.id === msg.id ? { ...m, applied: [...(m.applied ?? []), i] } : m,
      ),
    );
  };

  const empty = messages.length === 0;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-11rem)] max-w-3xl flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            Assistant
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Ask about WHS, or about {s.all ? "every project" : s.scopeLabel}. It
            can draft changes for you to confirm.
          </p>
        </div>
        {!empty && (
          <button type="button" onClick={reset} className={btnLight}>
            <Icon name="plus" className="h-4 w-4" /> New chat
          </button>
        )}
      </div>

      <div className="flex-1 space-y-6 pb-6">
        {empty && (
          <div className="pt-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-ink">
              <Icon name="sparkle" className="h-6 w-6" />
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight">
              How can I help on site?
            </h2>
            <p className="mt-2 max-w-xl text-ink-soft">
              I can explain Australian WHS requirements, read your projects,
              SWMS, risks, tickets and incidents to tell you what needs
              attention, and draft actions, incident reports, toolbox talks and
              risks. Nothing changes until you confirm it.
            </p>
            {(
              [
                ["WHS questions", SUGGESTIONS.safety],
                ["Your sites", SUGGESTIONS.site],
                ["Do it for me", SUGGESTIONS.act],
              ] as const
            ).map(([label, list]) => (
              <div key={label} className="mt-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">
                  {label}
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {list.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void send(q)}
                      className="rounded-2xl border border-line bg-surface p-4 text-left text-sm font-medium transition-colors hover:border-ink hover:bg-tint/60"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {messages.map((m, i) => {
          if (m.role === "user")
            return (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-ink px-4 py-3 text-[15px] leading-relaxed text-bg">
                  {m.content}
                </p>
              </div>
            );
          const { text, proposals } = splitReply(m.content);
          return (
            <div key={m.id} className="flex gap-3">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-ink">
                <Icon name="sparkle" className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1 space-y-3 pt-1">
                {text ? (
                  <Markdown text={text} />
                ) : busy && i === messages.length - 1 ? (
                  <p className="text-sm text-ink-soft">Thinking</p>
                ) : null}
                {proposals.length > 0 && (
                  <ul className="space-y-2">
                    {proposals.map((p, k) => {
                      const done = m.applied?.includes(k);
                      return (
                        <li
                          key={k}
                          className="rounded-2xl border border-accent/40 bg-accent/[0.07] p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <Pill tone="neutral">
                              {p.type === "create_action"
                                ? "Corrective action"
                                : p.type === "report_incident"
                                  ? "Incident report"
                                  : p.type === "schedule_talk"
                                    ? "Toolbox talk"
                                    : "Risk register"}
                            </Pill>
                            <span className="text-xs text-ink-soft">
                              {p.project || s.scopeLabel}
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-semibold">
                            {p.type === "schedule_talk"
                              ? p.topic
                              : p.type === "add_risk"
                                ? p.hazard
                                : p.title}
                          </p>
                          <p className="mt-0.5 text-xs text-ink-soft">
                            {p.type === "create_action" &&
                              `Owner ${p.owner || me.name} · due in ${p.days} days`}
                            {p.type === "report_incident" &&
                              `${p.incidentType} · ${p.severity} · ${p.location}`}
                            {p.type === "schedule_talk" && `In ${p.days} days`}
                            {p.type === "add_risk" &&
                              `${p.category} · likelihood ${p.likelihood}, consequence ${p.consequence}`}
                          </p>
                          <div className="mt-3">
                            {done ? (
                              <Pill tone="ok">Added</Pill>
                            ) : (
                              <button
                                type="button"
                                onClick={() => apply(m, k, p)}
                                className={`${btnDark} !px-4 !py-1.5 text-xs`}
                              >
                                <Icon name="check" className="h-3.5 w-3.5" />{" "}
                                Confirm and add
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          );
        })}

        {problem && (
          <div
            role="alert"
            className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm"
          >
            <p className="font-semibold">
              {problem.code === "not_configured"
                ? "The assistant is not connected yet"
                : "Something went wrong"}
            </p>
            <p className="mt-1 text-ink-soft">
              {problem.code === "not_configured"
                ? "Ask whoever manages WHSCOMPLY to switch it on."
                : problem.text}
            </p>
            {problem.code === "not_configured" && (
              <p className="mt-2 text-xs text-ink-soft">
                For whoever sets this up: add{" "}
                <code className="rounded bg-tint px-1 py-0.5 font-mono">
                  ANTHROPIC_API_KEY=...
                </code>{" "}
                to{" "}
                <code className="rounded bg-tint px-1 py-0.5 font-mono">
                  .env.local
                </code>{" "}
                and restart the server.
              </p>
            )}
          </div>
        )}
        <div ref={bottom} />
      </div>

      <div className="sticky bottom-0 -mx-4 bg-gradient-to-t from-bg from-70% to-transparent px-4 pb-4 pt-2 sm:-mx-8 sm:px-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex items-end gap-2 rounded-3xl border border-line bg-surface p-2 shadow-sm focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30"
        >
          <label className="min-w-0 flex-1">
            <span className="sr-only">Ask the assistant</span>
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
              placeholder="Ask about WHS, your sites, or tell me what to log"
              className="max-h-44 w-full resize-none bg-transparent px-3 py-2.5 text-[15px] text-ink outline-none placeholder:text-ink-soft"
            />
          </label>
          <span className="hidden pb-1.5 sm:block">
            <VoiceButton
              label="Speak"
              onText={(t) => setInput((v) => `${v}${v ? " " : ""}${t}`)}
            />
          </span>
          {busy ? (
            <button
              type="button"
              onClick={() => abort.current?.abort()}
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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-bg disabled:opacity-30"
            >
              <Icon name="arrow" className="h-4 w-4 -rotate-90" />
            </button>
          )}
        </form>
        <p className="mt-2 text-center text-[11px] text-ink-soft">
          The assistant can make mistakes. WHS answers are general information,
          not legal advice. Your site data for the selected project is sent with
          each question.
        </p>
      </div>
    </div>
  );
}
