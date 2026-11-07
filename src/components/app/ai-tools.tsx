"use client";

import { useState } from "react";
import type {
  HazardPhoto,
  Investigation,
  SummaryDraft,
  SwmsReview,
  TemplateDraft,
} from "@/lib/ai-types";
import { addDays, rating, type Incident, type Swms } from "@/lib/data";
import { Icon } from "../Icons";
import {
  AI_NOTE,
  aiBtn,
  aiBtnLight,
  AiPanel,
  AiProblem,
  Busy,
  FileButton,
  Sparkle,
  useAi,
  useAiContext,
} from "./ai";
import { useScope } from "./DemoStore";
import { Modal } from "./Modal";
import { btnDark, btnLight, field, Pill, RiskPill } from "./ui";

/* ---------- SWMS review ---------- */

export function SwmsReviewPanel({ swms }: { swms: Swms }) {
  const ai = useAi();
  const [out, setOut] = useState<SwmsReview | null>(null);
  const go = async () =>
    setOut(
      await ai.run<SwmsReview>("swmsReview", {
        swms: { title: swms.title, highRisk: swms.highRisk, steps: swms.steps },
      }),
    );
  return (
    <AiPanel
      title="AI safety review"
      hint="Checks this SWMS for missing hazards, weak controls and gaps against what a SWMS must contain."
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={ai.busy}
          onClick={() => void go()}
          className={aiBtn}
        >
          <Sparkle /> {out ? "Review again" : "Review this SWMS"}
        </button>
        {ai.busy && <Busy label="Reviewing" />}
      </div>
      <AiProblem problem={ai.problem} />
      {out && (
        <div className="space-y-2">
          <p className="text-sm">{out.summary}</p>
          <ul className="space-y-2">
            {out.findings.map((f, i) => (
              <li
                key={i}
                className="rounded-xl border border-line bg-surface p-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Pill
                    tone={
                      f.level === "gap"
                        ? "owed"
                        : f.level === "ok"
                          ? "ok"
                          : "neutral"
                    }
                  >
                    {f.level === "gap"
                      ? "Gap"
                      : f.level === "ok"
                        ? "Good"
                        : "Improve"}
                  </Pill>
                  <p className="font-semibold">{f.issue}</p>
                </div>
                {f.fix && (
                  <p className="mt-1.5 text-xs text-ink-soft">{f.fix}</p>
                )}
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-soft">{AI_NOTE}</p>
        </div>
      )}
    </AiPanel>
  );
}

/* ---------- incident investigation ---------- */

export function InvestigatePanel({ incident }: { incident: Incident }) {
  const s = useScope();
  const ai = useAi();
  const context = useAiContext();
  const [out, setOut] = useState<Investigation | null>(null);
  const [added, setAdded] = useState<number[]>([]);

  const go = async () => {
    setAdded([]);
    setOut(
      await ai.run<Investigation>("investigate", {
        incident,
        context: context(),
      }),
    );
  };

  return (
    <AiPanel
      title="Help me investigate"
      hint="Suggests likely root causes and corrective actions using what is recorded about this incident and your site."
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={ai.busy}
          onClick={() => void go()}
          className={aiBtn}
        >
          <Sparkle /> {out ? "Run again" : "Suggest causes and actions"}
        </button>
        {ai.busy && <Busy label="Thinking it through" />}
      </div>
      <AiProblem problem={ai.problem} />
      {out && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">{out.summary}</p>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-ink-soft">
              Likely causes
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {out.causes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            {!incident.cause &&
              out.causes.length > 0 &&
              incident.status !== "Closed" && (
                <button
                  type="button"
                  onClick={() =>
                    s.updateIncident(incident.id, {
                      cause: out.causes.join(" "),
                    })
                  }
                  className={`${aiBtnLight} mt-2 !px-3 !py-1.5 text-xs`}
                >
                  Use as the recorded cause
                </button>
              )}
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-ink-soft">
              Suggested actions
            </p>
            <ul className="space-y-2">
              {out.actions.map((a, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 text-sm"
                >
                  <span className="min-w-0 flex-1">
                    {a.title}
                    <span className="block text-xs text-ink-soft">
                      Due in {a.days} days
                    </span>
                  </span>
                  {added.includes(i) ? (
                    <Pill tone="ok">Added</Pill>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        s.addAction({
                          projectId: incident.projectId,
                          title: a.title,
                          source: "Incident",
                          sourceLabel: incident.title,
                          owner: "Sam Kowalski",
                          due: addDays(a.days),
                        });
                        setAdded([...added, i]);
                      }}
                      className={`${btnDark} !px-3 !py-1.5 text-xs`}
                    >
                      Add action
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          {out.notifiableNote && (
            <p className="text-xs text-ink-soft">{out.notifiableNote}</p>
          )}
          <p className="text-xs text-ink-soft">
            {AI_NOTE} These are suggestions to check against what was found on
            site.
          </p>
        </div>
      )}
    </AiPanel>
  );
}

/* ---------- weekly summary ---------- */

export function SummaryPanel() {
  const s = useScope();
  const ai = useAi();
  const context = useAiContext();
  const [out, setOut] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const go = async () => {
    const r = await ai.run<SummaryDraft>("summary", {
      scope: s.scopeLabel,
      context: context(),
    });
    setOut(r?.text ?? null);
  };

  return (
    <AiPanel
      title="Weekly safety summary"
      hint={`Writes a client-ready summary of ${s.all ? "every project" : s.scopeLabel} from the records in WHSCOMPLY.`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={ai.busy}
          onClick={() => void go()}
          className={aiBtn}
        >
          <Sparkle /> {out ? "Write it again" : "Write the summary"}
        </button>
        {ai.busy && <Busy label="Writing" />}
      </div>
      <AiProblem problem={ai.problem} />
      {out && (
        <div className="space-y-2">
          <textarea
            value={out}
            onChange={(e) => setOut(e.target.value)}
            rows={14}
            aria-label="Weekly summary"
            className={`${field} font-sans`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(out).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                });
              }}
              className={aiBtnLight}
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <span className="text-xs text-ink-soft">
              {AI_NOTE} You can edit it above before you send it.
            </span>
          </div>
        </div>
      )}
    </AiPanel>
  );
}

/* ---------- hazards from a site photo ---------- */

export function PhotoHazardsModal({ onClose }: { onClose: () => void }) {
  const s = useScope();
  const ai = useAi();
  const [out, setOut] = useState<HazardPhoto | null>(null);
  const [added, setAdded] = useState<number[]>([]);
  const [projectId, setProjectId] = useState(s.all ? "" : s.scopeId);

  return (
    <Modal
      title="Spot hazards in a photo"
      sub="Take or upload a photo of the work area and the AI lists the hazards it can see"
      onClose={onClose}
      wide
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <FileButton
            label="Photograph or upload"
            accept="image/*"
            disabled={ai.busy}
            onError={(m) => ai.setProblem({ code: "file", message: m })}
            onFile={async (f) => {
              setAdded([]);
              setOut(await ai.run<HazardPhoto>("hazardPhoto", {}, f));
            }}
          />
          {ai.busy && <Busy label="Looking at the photo" />}
        </div>
        <AiProblem problem={ai.problem} />
        {out && (
          <>
            <p className="text-sm">{out.summary}</p>
            {s.all && out.hazards.length > 0 && (
              <label className="block text-sm font-medium">
                Add to the register of
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className={field}
                >
                  <option value="" disabled>
                    Choose a project
                  </option>
                  {s.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <ul className="space-y-2">
              {out.hazards.map((h, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-line bg-surface p-3 text-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 font-semibold">{h.hazard}</p>
                    <RiskPill level={rating(h.likelihood, h.consequence)} />
                  </div>
                  <p className="mt-1 text-xs text-ink-soft">{h.category}</p>
                  <p className="mt-1 text-xs text-ink-soft">{h.controls}</p>
                  <div className="mt-2">
                    {added.includes(i) ? (
                      <Pill tone="ok">Added to the register</Pill>
                    ) : (
                      <button
                        type="button"
                        disabled={!projectId}
                        onClick={() => {
                          s.addRisk({
                            projectId,
                            hazard: h.hazard,
                            category: h.category,
                            likelihood: h.likelihood,
                            consequence: h.consequence,
                            controls: h.controls,
                            resL: h.resL,
                            resC: h.resC,
                            owner: "Sam Kowalski",
                            review: addDays(30),
                            status: "Open",
                          });
                          setAdded([...added, i]);
                        }}
                        className={`${btnDark} !px-3 !py-1.5 text-xs disabled:opacity-40`}
                      >
                        Add to risk register
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-xs text-ink-soft">
              {AI_NOTE} A photo cannot show everything, so walk the area as
              well.
            </p>
          </>
        )}
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className={btnLight}>
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- checklist builder ---------- */

export function TemplateModal({ onClose }: { onClose: () => void }) {
  const s = useScope();
  const ai = useAi();
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<TemplateDraft | null>(null);
  const [file, setFile] = useState<{
    mediaType: string;
    data: string;
    name?: string;
  } | null>(null);

  const make = async () => {
    const r = await ai.run<TemplateDraft>(
      "template",
      { text },
      file ?? undefined,
    );
    if (r) setDraft(r);
  };

  return (
    <Modal
      title="Build a checklist with AI"
      sub="Upload an existing form or paste it in. The AI turns it into a checklist you can use for inspections."
      onClose={onClose}
      wide
    >
      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          aria-label="Paste the checklist or describe what to check"
          placeholder="Paste a checklist, or describe it: 'Weekly crane and rigging inspection for a tower crane'"
          className={field}
        />
        <div className="flex flex-wrap items-center gap-2">
          <FileButton
            label={
              file
                ? `Attached: ${file.name ?? "file"}`
                : "Upload a photo or PDF"
            }
            disabled={ai.busy}
            onError={(m) => ai.setProblem({ code: "file", message: m })}
            onFile={setFile}
          />
          <button
            type="button"
            disabled={ai.busy || (!file && text.trim().length < 5)}
            onClick={() => void make()}
            className={aiBtn}
          >
            <Sparkle /> Build checklist
          </button>
          {ai.busy && <Busy label="Building" />}
        </div>
        <AiProblem problem={ai.problem} />
        {draft && (
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Checklist name
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className={field}
              />
            </label>
            <ol className="space-y-1.5">
              {draft.items.map((it, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-6 shrink-0 text-right font-mono text-xs text-ink-soft">
                    {i + 1}
                  </span>
                  <input
                    value={it}
                    aria-label={`Item ${i + 1}`}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        items: draft.items.map((x, k) =>
                          k === i ? e.target.value : x,
                        ),
                      })
                    }
                    className="w-full rounded-lg border border-line bg-bg px-3 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    aria-label={`Remove item ${i + 1}`}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        items: draft.items.filter((_, k) => k !== i),
                      })
                    }
                    className="text-ink-soft hover:text-ink"
                  >
                    <Icon name="close" className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ol>
            <p className="text-xs text-ink-soft">
              {AI_NOTE} Edit or remove anything before you save.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className={btnLight}>
                Cancel
              </button>
              <button
                type="button"
                disabled={!draft.name.trim() || draft.items.length === 0}
                onClick={() => {
                  s.addTemplate(
                    draft.name.trim(),
                    draft.items.filter((x) => x.trim()),
                  );
                  onClose();
                }}
                className={btnDark}
              >
                Save checklist
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
