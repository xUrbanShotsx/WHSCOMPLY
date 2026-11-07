"use client";

import { useMemo, useState } from "react";
import { Thumb } from "@/components/app/Attachments";
import { useScope } from "@/components/app/DemoStore";
import { Card, Chips, EmptyState, PageHeading } from "@/components/app/ui";
import type { Attachment } from "@/lib/files";
import { fmtDate } from "@/lib/format";

type Item = {
  a: Attachment;
  source: string;
  label: string;
  date: string;
  project: string;
};

export default function PhotosPage() {
  const s = useScope();
  const [src, setSrc] = useState("All");
  const pname = (id: string) => s.projects.find((p) => p.id === id)?.name ?? "";

  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    for (const d of s.diariesIn)
      for (const a of d.files)
        out.push({
          a,
          source: "Diary",
          label: d.summary,
          date: d.date,
          project: pname(d.projectId),
        });
    for (const d of s.defectsIn)
      for (const a of d.files)
        out.push({
          a,
          source: "Defects",
          label: d.title,
          date: d.raised,
          project: pname(d.projectId),
        });
    for (const i of s.incidentsIn)
      for (const a of i.files ?? [])
        out.push({
          a,
          source: "Incidents",
          label: i.title,
          date: i.date,
          project: pname(i.projectId),
        });
    for (const x of s.inspectionsIn)
      for (const it of x.items)
        for (const a of it.files ?? [])
          out.push({
            a,
            source: "Inspections",
            label: it.text,
            date: x.date,
            project: pname(x.projectId),
          });
    for (const c of s.chemicalsIn)
      for (const a of c.files ?? [])
        out.push({
          a,
          source: "SDS",
          label: c.name,
          date: c.sdsDate ?? "",
          project: pname(c.projectId),
        });
    return out
      .filter((x) => x.a.mime.startsWith("image/") || src !== "All")
      .sort((a, b) => b.date.localeCompare(a.date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, src]);

  const shown = items.filter((x) => src === "All" || x.source === src);

  return (
    <>
      <PageHeading
        title="Photos"
        sub="Every photo from diaries, defects, incidents and inspections in one view, with where it came from."
      />
      <Card>
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <Chips
            value={src}
            options={[
              "All",
              "Diary",
              "Defects",
              "Incidents",
              "Inspections",
              "SDS",
            ]}
            onChange={setSrc}
          />
          <span className="text-xs text-ink-soft">
            {shown.length} file{shown.length === 1 ? "" : "s"}
          </span>
        </div>
        {shown.length === 0 ? (
          <EmptyState
            title="No photos yet."
            body="Add photos to a diary entry, a defect, an incident or an inspection item and they appear here."
          />
        ) : (
          <ul className="grid gap-4 p-5 sm:grid-cols-3 lg:grid-cols-5">
            {shown.map((x) => (
              <li key={x.a.id}>
                <Thumb a={x.a} className="aspect-square h-auto w-full" />
                <p className="mt-1.5 truncate text-xs font-semibold">
                  {x.label}
                </p>
                <p className="truncate text-[11px] text-ink-soft">
                  {x.source} · {x.project}
                  {x.date && ` · ${fmtDate(x.date)}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
