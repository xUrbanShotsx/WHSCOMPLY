"use client";

import { useMemo } from "react";
import { attentionFor, type Attention } from "@/lib/attention";
import { useScope } from "./DemoStore";

/** What needs action across the current project selection. Empty until the browser has loaded. */
export function useAttention(): Attention[] {
  const s = useScope();
  return useMemo(() => {
    if (!s.ready) return [];
    const names = new Map(s.projects.map((p) => [p.id, p.name]));
    return attentionFor({
      workers: s.workersIn,
      subs: s.subsIn,
      swms: s.swmsIn,
      actions: s.actionsIn,
      risks: s.risksIn,
      incidents: s.incidentsIn,
      talks: s.talksIn,
      warnDays: s.settings.warnDays,
      notify: s.settings.notify,
      projectName: (id) => names.get(id) ?? "Project",
    });
  }, [s]);
}
