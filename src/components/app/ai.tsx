"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { callAi } from "@/lib/ai-client";
import { toAiFile } from "@/lib/ai-client";
import type { AiFile, AiTask } from "@/lib/ai-types";
import { todayISO } from "@/lib/format";
import { buildContext } from "@/lib/ai-context";
import { Icon } from "../Icons";
import { useScope } from "./DemoStore";

/** Runs one AI task and tracks whether it is busy or has failed. */
export function useAi() {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<{
    code: string;
    message: string;
  } | null>(null);

  const run = useCallback(
    async <T,>(task: AiTask, input: Record<string, unknown>, file?: AiFile) => {
      setBusy(true);
      setProblem(null);
      const r = await callAi<T>(task, input, file);
      setBusy(false);
      if (!r.ok) {
        setProblem({ code: r.code, message: r.message });
        return null;
      }
      return r.data;
    },
    [],
  );

  return { busy, problem, run, clear: () => setProblem(null), setProblem };
}

/** The workspace summary the AI reads, narrowed to the project picked in the top bar. */
export function useAiContext() {
  const s = useScope();
  return useCallback(
    () =>
      buildContext({
        scopeLabel: s.scopeLabel,
        today: todayISO(),
        company: s.settings.company.name,
        allProjects: s.projects,
        projects: s.projectsIn,
        workers: s.workersIn,
        subs: s.subsIn,
        swms: s.swmsIn,
        risks: s.risksIn,
        talks: s.talksIn,
        permits: s.permitsIn,
        plant: s.plantIn,
        chemicals: s.chemicalsIn,
        drills: s.drillsIn,
        visitors: s.visitorsIn,
        docs: s.docsIn,
        inspections: s.inspectionsIn,
        incidents: s.incidentsIn,
        actions: s.actionsIn,
        audit: s.auditIn,
        defects: s.defectsIn,
        rfis: s.rfisIn,
        tasks: s.tasksIn,
        diaries: s.diariesIn,
        notices: s.noticesIn,
        drawings: s.drawingsIn,
      }),
    [s],
  );
}

export function Sparkle({ className = "h-4 w-4" }: { className?: string }) {
  return <Icon name="sparkle" className={className} />;
}

export function AiProblem({
  problem,
}: {
  problem: { code: string; message: string } | null;
}) {
  if (!problem) return null;
  return (
    <div
      role="alert"
      className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm"
    >
      <p className="font-semibold">
        {problem.code === "not_configured"
          ? "The AI is not switched on yet"
          : "That did not work"}
      </p>
      <p className="mt-0.5 text-ink-soft">
        {problem.code === "not_configured"
          ? "Whoever manages WHSCOMPLY needs to add ANTHROPIC_API_KEY to the server and restart it."
          : problem.message}
      </p>
    </div>
  );
}

/** A framed block that holds an AI tool inside a form or page. */
export function AiPanel({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-accent/40 bg-accent/[0.07] p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-ink">
          <Sparkle />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">{title}</p>
          {hint && <p className="text-xs text-ink-soft">{hint}</p>}
        </div>
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

export const aiBtn =
  "inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg transition-colors hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-50";
export const aiBtnLight =
  "inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold transition-colors hover:bg-tint disabled:cursor-not-allowed disabled:opacity-50";

export function Busy({ label }: { label: string }) {
  return (
    <span
      role="status"
      className="inline-flex items-center gap-2 text-xs text-ink-soft"
    >
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-ink-soft/30 border-t-ink" />
      {label}
    </span>
  );
}

export const AI_NOTE = "AI can make mistakes. Check it before you save.";

/** Dictation through the browser's speech recognition. Hidden where the browser has none. */
export function VoiceButton({
  onText,
  label = "Speak",
}: {
  onText: (t: string) => void;
  label?: string;
}) {
  const [supported] = useState(
    () =>
      typeof window !== "undefined" &&
      !!(
        (window as unknown as Record<string, unknown>).SpeechRecognition ||
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition
      ),
  );
  const [on, setOn] = useState(false);
  const rec = useRef<{ stop: () => void } | null>(null);

  useEffect(() => () => rec.current?.stop(), []);

  if (!supported) return null;

  const toggle = () => {
    if (on) {
      rec.current?.stop();
      return;
    }
    const w = window as unknown as Record<
      string,
      new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        onresult: (e: {
          results: ArrayLike<
            ArrayLike<{ transcript: string }> & { isFinal: boolean }
          >;
        }) => void;
        onend: () => void;
        onerror: () => void;
        start: () => void;
        stop: () => void;
      }
    >;
    const R = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    const r = new R();
    r.lang = "en-AU";
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e) => {
      const last = e.results[e.results.length - 1];
      if (last?.isFinal) onText(last[0].transcript.trim());
    };
    r.onend = () => setOn(false);
    r.onerror = () => setOn(false);
    rec.current = r;
    setOn(true);
    r.start();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className={on ? aiBtn : aiBtnLight}
    >
      <span
        className={`h-2 w-2 rounded-full ${on ? "animate-pulse bg-accent" : "bg-ink-soft"}`}
      />
      {on ? "Listening, tap to stop" : label}
    </button>
  );
}

/** A button that opens the phone camera or file picker and hands back a ready-to-send file. */
export function FileButton({
  label,
  onFile,
  onError,
  disabled,
  accept = "image/*,application/pdf",
}: {
  label: string;
  onFile: (f: AiFile) => void;
  onError?: (m: string) => void;
  disabled?: boolean;
  accept?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => ref.current?.click()}
        className={aiBtnLight}
      >
        <Icon name="clip" className="h-4 w-4" /> {label}
      </button>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          try {
            onFile(await toAiFile(f));
          } catch (err) {
            onError?.((err as Error).message);
          }
        }}
      />
    </>
  );
}

/** Tidy, shorten, bullet or translate whatever is in a text box. */
export function TextTools({
  value,
  onChange,
}: {
  value: string;
  onChange: (t: string) => void;
}) {
  const ai = useAi();
  const [lang, setLang] = useState("Vietnamese");
  const go = async (mode: string) => {
    if (!value.trim()) return;
    const r = await ai.run<{ text: string }>("beautify", {
      text: value,
      mode,
      lang,
    });
    if (r?.text) onChange(r.text);
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 inline-flex items-center gap-1 text-xs font-semibold text-ink-soft">
          <Sparkle className="h-3.5 w-3.5" /> Improve
        </span>
        {[
          ["tidy", "Tidy"],
          ["shorten", "Shorten"],
          ["bullets", "Bullets"],
        ].map(([m, l]) => (
          <button
            key={m}
            type="button"
            disabled={ai.busy || !value.trim()}
            onClick={() => void go(m)}
            className="rounded-full bg-tint px-3 py-1 text-xs font-semibold hover:bg-line disabled:opacity-40"
          >
            {l}
          </button>
        ))}
        <select
          aria-label="Translate to"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="rounded-full bg-tint px-2 py-1 text-xs font-semibold"
        >
          {[
            "Vietnamese",
            "Arabic",
            "Mandarin",
            "Cantonese",
            "Greek",
            "Italian",
            "Hindi",
            "Spanish",
            "Samoan",
            "Tongan",
          ].map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <button
          type="button"
          disabled={ai.busy || !value.trim()}
          onClick={() => void go("translate")}
          className="rounded-full bg-tint px-3 py-1 text-xs font-semibold hover:bg-line disabled:opacity-40"
        >
          Translate
        </button>
        {ai.busy && <Busy label="Working" />}
      </div>
      <AiProblem problem={ai.problem} />
    </div>
  );
}
