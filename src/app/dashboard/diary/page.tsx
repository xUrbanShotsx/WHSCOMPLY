"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { SummaryPanel } from "@/components/app/ai-tools";
import { TextTools } from "@/components/app/ai";
import { AttachField, AttachmentStrip } from "@/components/app/Attachments";
import { useScope } from "@/components/app/DemoStore";
import { Actions, fd, Shell } from "@/components/app/forms";
import {
  Avatar,
  btnDark,
  Card,
  EmptyState,
  Field,
  field,
  PageHeading,
  Pill,
} from "@/components/app/ui";
import type { DiaryEntry, Weather } from "@/lib/data";
import { WEATHER } from "@/lib/data";
import type { Attachment } from "@/lib/files";
import { fmtDate, todayISO } from "@/lib/format";

function DiaryForm({ onClose }: { onClose: () => void }) {
  const s = useScope();
  const [projectId, setProjectId] = useState(s.all ? "" : s.scopeId);
  const [workDone, setWorkDone] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const onSite = s.projects.find((p) => p.id === projectId)?.onSite ?? [];

  return (
    <Shell
      title="New site diary entry"
      sub="Attendance is taken from who is signed on at the gate right now"
      onClose={onClose}
      wide
    >
      <form
        onSubmit={(e) => {
          const g = fd(e);
          s.add(
            "diaries",
            {
              projectId,
              date: g("date"),
              weather: g("weather") as Weather,
              temp: g("temp") ? Number(g("temp")) : null,
              summary: g("summary"),
              workDone,
              delays: g("delays"),
              safety: g("safety"),
              workers: onSite,
              author: g("author"),
              files,
            },
            {
              area: "Diary",
              projectId,
              act: `wrote the site diary for ${fmtDate(g("date"))}`,
              to: "Recorded",
            },
          );
          onClose();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
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
        <Field label="Date">
          <input
            name="date"
            type="date"
            required
            defaultValue={todayISO()}
            className={field}
          />
        </Field>
        <Field label="Weather">
          <select name="weather" defaultValue="Fine" className={field}>
            {WEATHER.map((w) => (
              <option key={w}>{w}</option>
            ))}
          </select>
        </Field>
        <Field label="Temperature (°C)" hint="optional">
          <input
            name="temp"
            type="number"
            min={-10}
            max={55}
            className={field}
          />
        </Field>
        <Field label="Summary of the day" className="sm:col-span-2">
          <input name="summary" required className={field} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Work completed">
            <textarea
              required
              rows={4}
              value={workDone}
              onChange={(e) => setWorkDone(e.target.value)}
              className={field}
            />
          </Field>
          <div className="mt-2">
            <TextTools value={workDone} onChange={setWorkDone} />
          </div>
        </div>
        <Field label="Delays" hint="optional" className="sm:col-span-2">
          <textarea name="delays" rows={2} className={field} />
        </Field>
        <Field label="Safety notes" hint="optional" className="sm:col-span-2">
          <textarea name="safety" rows={2} className={field} />
        </Field>
        <Field label="Written by">
          <input
            name="author"
            required
            defaultValue="Sam Kowalski"
            className={field}
          />
        </Field>
        <div>
          <p className="text-sm font-medium">Attendance</p>
          <p className="mt-1 text-sm text-ink-soft">
            {projectId
              ? `${onSite.length} signed on at the gate`
              : "Choose a project"}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="mb-1 text-sm font-medium">Photos</p>
          <AttachField files={files} onChange={setFiles} />
        </div>
        <div className="sm:col-span-2">
          <Actions onClose={onClose} submit="Save entry" />
        </div>
      </form>
    </Shell>
  );
}

export default function DiaryPage() {
  const s = useScope();
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [week, setWeek] = useState(false);

  const list = [...s.diariesIn].sort((a, b) => b.date.localeCompare(a.date));
  const nameOf = (id: string) =>
    s.workers.find((w) => w.id === id)?.name ?? "Unknown";

  return (
    <>
      <PageHeading
        title="Site diary"
        sub="The day on site, captured daily: weather, work done, delays, safety and who was there. Sign-ons roll into attendance automatically."
        actions={
          <>
            <button
              type="button"
              onClick={() => setWeek((w) => !w)}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-tint"
            >
              {week ? "Hide" : "Weekly summary"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(true)}
              className={btnDark}
            >
              <Icon name="plus" className="h-4 w-4" /> New entry
            </button>
          </>
        }
      />
      {week && (
        <div className="mb-6">
          <SummaryPanel />
        </div>
      )}
      <Card>
        {list.length === 0 ? (
          <EmptyState
            title="No diary entries yet."
            body="Write the first entry for today."
          />
        ) : (
          <ul>
            {list.map((d: DiaryEntry) => {
              const isOpen = open === d.id;
              return (
                <li key={d.id} className="border-b border-line last:border-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : d.id)}
                    className="grid w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-tint/60 md:grid-cols-[8rem_1fr_auto_auto]"
                  >
                    <span>
                      <span className="block text-sm font-semibold">
                        {fmtDate(d.date)}
                      </span>
                      <span className="block text-xs text-ink-soft">
                        {d.weather}
                        {d.temp !== null && `, ${d.temp}°C`}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {d.summary}
                      </span>
                      <span className="block truncate text-xs text-ink-soft">
                        {s.all &&
                          `${s.projects.find((p) => p.id === d.projectId)?.name} · `}
                        by {d.author}
                      </span>
                    </span>
                    <span className="flex flex-wrap gap-2">
                      <Pill tone="neutral">{d.workers.length} on site</Pill>
                      {d.delays && <Pill tone="owed">Delay</Pill>}
                      {d.files.length > 0 && (
                        <Pill tone="neutral">
                          {d.files.length} photo
                          {d.files.length === 1 ? "" : "s"}
                        </Pill>
                      )}
                    </span>
                    <Icon
                      name="arrow"
                      className={`h-4 w-4 justify-self-end text-ink-soft transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="space-y-4 border-t border-line bg-bg px-5 py-4 text-sm">
                      {[
                        ["Work completed", d.workDone],
                        ["Delays", d.delays],
                        ["Safety", d.safety],
                      ]
                        .filter(([, v]) => v)
                        .map(([k, v]) => (
                          <div key={k}>
                            <p className="mb-0.5 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                              {k}
                            </p>
                            <p className="whitespace-pre-wrap">{v}</p>
                          </div>
                        ))}
                      <AttachmentStrip files={d.files} />
                      <div>
                        <p className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                          Attendance
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {d.workers.map((id, i) => (
                            <span
                              key={id}
                              className="inline-flex items-center gap-2 rounded-full bg-surface px-2.5 py-1 text-xs font-medium ring-1 ring-line"
                            >
                              <Avatar
                                initials={nameOf(id)
                                  .split(" ")
                                  .map((x) => x[0])
                                  .join("")}
                                tone={(i % 3) as 0 | 1 | 2}
                              />
                              {nameOf(id)}
                            </span>
                          ))}
                          {d.workers.length === 0 && (
                            <span className="text-ink-soft">
                              Nobody was signed on.
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          window.confirm("Delete this diary entry?") &&
                          s.remove("diaries", d.id)
                        }
                        className="text-xs font-semibold text-ink-soft underline hover:text-ink"
                      >
                        Delete entry
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      {adding && <DiaryForm onClose={() => setAdding(false)} />}
    </>
  );
}
