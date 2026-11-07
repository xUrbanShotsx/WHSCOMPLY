"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import {
  AI_NOTE,
  AiProblem,
  Busy,
  FileButton,
  Sparkle,
  useAi,
} from "@/components/app/ai";
import { AttachmentStrip } from "@/components/app/Attachments";
import { useScope } from "@/components/app/DemoStore";
import { Actions, Shell } from "@/components/app/forms";
import {
  Card,
  Chips,
  EmptyState,
  Field,
  field,
  PageHeading,
  Pill,
  btnDark,
  btnLight,
} from "@/components/app/ui";
import type { AiFile, DrawingRead } from "@/lib/ai-types";
import { DISCIPLINES, type Drawing } from "@/lib/data";
import { saveAttachment, type Attachment } from "@/lib/files";
import { fmtDate, todayISO } from "@/lib/format";

const nextRev = (r: string) => {
  if (/^[A-Y]$/i.test(r))
    return String.fromCharCode(r.toUpperCase().charCodeAt(0) + 1);
  const n = Number(r);
  return Number.isFinite(n) && r !== "" ? String(n + 1) : "";
};

/** A base64 file from the AI picker back into a File, so it can be stored with the drawing. */
const toFile = (f: AiFile) => {
  const bin = atob(f.data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], f.name ?? "drawing", { type: f.mediaType });
};

function DrawingForm({ onClose }: { onClose: () => void }) {
  const s = useScope();
  const ai = useAi();
  const [projectId, setProjectId] = useState(s.all ? "" : s.scopeId);
  const [v, setV] = useState({
    number: "",
    title: "",
    discipline: "Structural",
    rev: "A",
    note: "Issued for construction",
  });
  const [file, setFile] = useState<Attachment | null>(null);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) =>
    setV((p) => ({ ...p, [k]: e.target.value }));
  const existing = s.drawings.find(
    (d) =>
      d.projectId === projectId &&
      d.number.toLowerCase() === v.number.trim().toLowerCase(),
  );

  const read = async (f: AiFile) => {
    try {
      setFile(await saveAttachment(toFile(f)));
    } catch {
      /* the AI read can still proceed without a stored copy */
    }
    const r = await ai.run<DrawingRead>("drawing", {}, f);
    if (!r) return;
    setV((p) => ({
      ...p,
      number: r.number || p.number,
      title: r.title || p.title,
      rev: r.revision || p.rev,
      discipline: DISCIPLINES.includes(r.discipline)
        ? r.discipline
        : p.discipline,
    }));
  };

  return (
    <Shell
      title="Add a drawing or revision"
      sub="Upload a sheet and the AI reads its title block. If the number already exists it is added as a new revision."
      onClose={onClose}
      wide
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const rev = {
            rev: v.rev,
            date: todayISO(),
            note: v.note,
            file: file ?? undefined,
          };
          if (existing) {
            s.patch(
              "drawings",
              existing.id,
              { revisions: [rev, ...existing.revisions] },
              {
                area: "Drawings",
                projectId,
                act: `issued revision ${v.rev} of ${existing.number}`,
                from: `Rev ${existing.revisions[0]?.rev}`,
                to: `Rev ${v.rev}`,
              },
            );
          } else {
            s.add(
              "drawings",
              {
                projectId,
                number: v.number,
                title: v.title,
                discipline: v.discipline,
                revisions: [rev],
              },
              {
                area: "Drawings",
                projectId,
                act: `added the drawing ${v.number} ${v.title}`,
                to: `Rev ${v.rev}`,
              },
            );
          }
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2 flex flex-wrap items-center gap-2 rounded-2xl border border-accent/40 bg-accent/[0.07] px-4 py-3">
          <Sparkle />
          <p className="min-w-0 flex-1 text-xs text-ink-soft">
            Upload the sheet (PDF or photo) and the AI reads the number, title
            and revision. {AI_NOTE}
          </p>
          <FileButton
            label={file ? "Replace file" : "Upload sheet"}
            disabled={ai.busy}
            onFile={(f) => void read(f)}
            onError={(m) => ai.setProblem({ code: "file", message: m })}
          />
          {ai.busy && <Busy label="Reading the title block" />}
        </div>
        <div className="sm:col-span-2">
          <AiProblem problem={ai.problem} />
          {file && (
            <p className="text-xs text-ink-soft">Attached: {file.name}</p>
          )}
        </div>
        <Field label="Project">
          <select
            required
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className={field}
          >
            {s.all && (
              <option value="" disabled>
                Choose a project
              </option>
            )}
            {s.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Drawing number">
          <input
            required
            value={v.number}
            onChange={set("number")}
            className={field}
            placeholder="S-203"
          />
        </Field>
        <Field label="Title" className="sm:col-span-2">
          <input
            required={!existing}
            value={existing ? existing.title : v.title}
            onChange={set("title")}
            disabled={!!existing}
            className={field}
          />
        </Field>
        {existing ? (
          <p className="rounded-xl border border-line bg-tint/60 px-3 py-2.5 text-xs sm:col-span-2">
            {existing.number} already exists at revision{" "}
            {existing.revisions[0]?.rev}. This will be added as revision{" "}
            <strong>
              {v.rev || nextRev(existing.revisions[0]?.rev ?? "")}
            </strong>
            , and the earlier revisions are kept.
          </p>
        ) : (
          <Field label="Discipline">
            <select
              value={v.discipline}
              onChange={set("discipline")}
              className={field}
            >
              {DISCIPLINES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Revision">
          <input
            required
            value={v.rev}
            onChange={set("rev")}
            className={field}
          />
        </Field>
        <Field label="What changed" className="sm:col-span-2">
          <input
            required
            value={v.note}
            onChange={set("note")}
            className={field}
          />
        </Field>
        <div className="sm:col-span-2">
          <Actions
            onClose={onClose}
            submit={existing ? "Add revision" : "Add drawing"}
          />
        </div>
      </form>
    </Shell>
  );
}

export default function DrawingsPage() {
  const s = useScope();
  const [disc, setDisc] = useState("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [revFor, setRevFor] = useState<Drawing | null>(null);

  const list = s.drawingsIn.filter(
    (d) =>
      (disc === "All" || d.discipline === disc) &&
      `${d.number} ${d.title}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeading
        title="Drawings"
        sub="The current set, with every revision kept. Add a new revision and the old one is marked superseded, so nobody builds from an out-of-date sheet."
        actions={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={btnDark}
          >
            <Icon name="plus" className="h-4 w-4" /> Add drawing
          </button>
        }
      />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3">
          <label className="flex min-w-[12rem] flex-1 items-center gap-2 rounded-full bg-bg px-3 py-2 text-sm text-ink-soft focus-within:ring-2 focus-within:ring-accent">
            <Icon name="search" className="h-4 w-4" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search number or title"
              aria-label="Search drawings"
              className="w-full bg-transparent text-ink outline-none placeholder:text-ink-soft"
            />
          </label>
          <Chips
            value={disc}
            options={["All", ...DISCIPLINES.slice(0, 5)]}
            onChange={setDisc}
          />
        </div>
        {list.length === 0 ? (
          <EmptyState
            title="No drawings here."
            body="Add the issued-for-construction set so everyone works from the current sheet."
          />
        ) : (
          <ul>
            {list.map((d) => {
              const cur = d.revisions[0];
              const isOpen = open === d.id;
              return (
                <li key={d.id} className="border-b border-line last:border-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : d.id)}
                    className="grid w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-tint/60 md:grid-cols-[6rem_1.6fr_1fr_auto]"
                  >
                    <span className="font-mono text-sm font-semibold">
                      {d.number}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {d.title}
                      </span>
                      <span className="block truncate text-xs text-ink-soft">
                        {s.all &&
                          `${s.projects.find((p) => p.id === d.projectId)?.name} · `}
                        {d.discipline} · updated {fmtDate(cur.date)}
                      </span>
                    </span>
                    <span className="flex gap-2">
                      <Pill tone="ok">Current: Rev {cur.rev}</Pill>
                      {d.revisions.length > 1 && (
                        <Pill tone="neutral">
                          {d.revisions.length} revisions
                        </Pill>
                      )}
                    </span>
                    <Icon
                      name="arrow"
                      className={`h-4 w-4 justify-self-end text-ink-soft transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-line bg-bg px-5 py-4">
                      <ol className="space-y-2">
                        {d.revisions.map((r, i) => (
                          <li
                            key={r.rev + r.date}
                            className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm"
                          >
                            <span className="w-14 shrink-0 font-mono font-semibold">
                              Rev {r.rev}
                            </span>
                            <span className="min-w-0 flex-1">
                              {r.note}
                              <span className="block text-xs text-ink-soft">
                                {fmtDate(r.date)}
                              </span>
                            </span>
                            {r.file && <AttachmentStrip files={[r.file]} />}
                            <Pill tone={i === 0 ? "ok" : "neutral"}>
                              {i === 0 ? "Current" : "Superseded"}
                            </Pill>
                          </li>
                        ))}
                      </ol>
                      <div className="mt-3 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setRevFor(d)}
                          className={`${btnLight} !px-3 !py-1.5 text-xs`}
                        >
                          <Icon name="plus" className="h-3.5 w-3.5" /> New
                          revision
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            window.confirm(
                              "Delete this drawing and its history?",
                            ) && s.remove("drawings", d.id)
                          }
                          className="text-xs font-semibold text-ink-soft underline hover:text-ink"
                        >
                          Delete drawing
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      {adding && <DrawingForm onClose={() => setAdding(false)} />}
      {revFor && <RevisionModal d={revFor} onClose={() => setRevFor(null)} />}
    </>
  );
}

function RevisionModal({ d, onClose }: { d: Drawing; onClose: () => void }) {
  const s = useScope();
  return (
    <Shell
      title={`New revision of ${d.number}`}
      sub={d.title}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const g = new FormData(e.currentTarget);
          const rev = String(g.get("rev"));
          s.patch(
            "drawings",
            d.id,
            {
              revisions: [
                { rev, date: todayISO(), note: String(g.get("note")) },
                ...d.revisions,
              ],
            },
            {
              area: "Drawings",
              projectId: d.projectId,
              act: `issued revision ${rev} of ${d.number}`,
              from: `Rev ${d.revisions[0]?.rev}`,
              to: `Rev ${rev}`,
            },
          );
          onClose();
        }}
        className="grid gap-4"
      >
        <Field label="Revision">
          <input
            name="rev"
            required
            defaultValue={nextRev(d.revisions[0]?.rev ?? "")}
            className={field}
          />
        </Field>
        <Field label="What changed">
          <input name="note" required className={field} />
        </Field>
        <Actions onClose={onClose} submit="Issue revision" />
      </form>
    </Shell>
  );
}
