"use client";

import { useRouter } from "next/navigation";
import {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { rating } from "@/lib/data";
import { fmtDate } from "@/lib/format";
import { Icon, type IconName } from "../Icons";
import { useStore } from "./DemoStore";

type Hit = {
  id: string;
  group: string;
  icon: IconName;
  title: string;
  sub?: string;
  href: string;
  /** What the query is matched against. */
  text: string;
};

const PAGES: { title: string; href: string; icon: IconName; words: string }[] =
  [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "grid",
      words: "home overview needs attention",
    },
    {
      title: "Assistance",
      href: "/dashboard/assistant",
      icon: "sparkle",
      words: "assistant ai chat agent help",
    },
    {
      title: "AI toolkit",
      href: "/dashboard/ai",
      icon: "list",
      words: "ai tools voice scan draft",
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: "scale",
      words: "ltifr trifr kpi statistics injury rates summary",
    },
    {
      title: "Site diary",
      href: "/dashboard/diary",
      icon: "book",
      words: "daily weather attendance",
    },
    {
      title: "Programme",
      href: "/dashboard/programme",
      icon: "calendar",
      words: "schedule gantt tasks timeline",
    },
    {
      title: "Drawings",
      href: "/dashboard/drawings",
      icon: "file",
      words: "revisions plans sheets",
    },
    {
      title: "RFIs",
      href: "/dashboard/rfis",
      icon: "list",
      words: "request for information",
    },
    {
      title: "Defects",
      href: "/dashboard/defects",
      icon: "pencil",
      words: "snags quality",
    },
    {
      title: "Photos",
      href: "/dashboard/photos",
      icon: "clip",
      words: "gallery images",
    },
    {
      title: "Site notices",
      href: "/dashboard/notices",
      icon: "bell",
      words: "alerts messages announcements",
    },
    {
      title: "SWMS",
      href: "/dashboard/swms",
      icon: "file",
      words: "safe work method statements sign",
    },
    {
      title: "Permits to work",
      href: "/dashboard/permits",
      icon: "lock",
      words: "hot work confined space excavation crane isolation",
    },
    {
      title: "Risk register",
      href: "/dashboard/risks",
      icon: "alert",
      words: "hazards heat map matrix controls",
    },
    {
      title: "Toolbox talks",
      href: "/dashboard/toolbox",
      icon: "users",
      words: "briefing attendance",
    },
    {
      title: "Inspections",
      href: "/dashboard/inspections",
      icon: "clipboard",
      words: "checklist schedule scaffold site walk",
    },
    {
      title: "Incidents",
      href: "/dashboard/incidents",
      icon: "shield",
      words: "near miss injury report notifiable investigation",
    },
    {
      title: "Actions",
      href: "/dashboard/actions",
      icon: "check",
      words: "corrective overdue",
    },
    {
      title: "Plant and equipment",
      href: "/dashboard/plant",
      icon: "settings",
      words: "prestart service test tag defect crane ewp",
    },
    {
      title: "Hazardous chemicals",
      href: "/dashboard/chemicals",
      icon: "flag",
      words: "sds safety data sheet dangerous goods",
    },
    {
      title: "Emergency",
      href: "/dashboard/emergency",
      icon: "bell",
      words: "evacuation drill assembly point warden hospital",
    },
    {
      title: "Workers and tickets",
      href: "/dashboard/people",
      icon: "id",
      words: "white card licence expiry crew",
    },
    {
      title: "Inductions",
      href: "/dashboard/inductions",
      icon: "user",
      words: "site induction sign",
    },
    {
      title: "Training matrix",
      href: "/dashboard/training",
      icon: "list",
      words: "competency skills",
    },
    {
      title: "Subcontractors",
      href: "/dashboard/subcontractors",
      icon: "store",
      words: "prequalification insurance workcover approve",
    },
    {
      title: "Visitors",
      href: "/dashboard/visitors",
      icon: "user",
      words: "sign in out",
    },
    {
      title: "Consultation",
      href: "/dashboard/consultation",
      icon: "calendar",
      words: "whs committee meeting pre-start",
    },
    {
      title: "Documents",
      href: "/dashboard/documents",
      icon: "book",
      words: "policies procedures plans",
    },
    {
      title: "Projects",
      href: "/dashboard/projects",
      icon: "building",
      words: "sites gate sign on off locations",
    },
    {
      title: "Audit log",
      href: "/dashboard/audit",
      icon: "clock",
      words: "export pack history",
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: "settings",
      words: "company team roles notifications warn",
    },
    {
      title: "Report an incident",
      href: "/dashboard/incidents",
      icon: "plus",
      words: "new near miss hazard",
    },
    {
      title: "New SWMS",
      href: "/dashboard/swms",
      icon: "plus",
      words: "draft create",
    },
  ];

const ORDER = [
  "Pages",
  "Projects",
  "SWMS",
  "Risks",
  "Permits",
  "Incidents",
  "Actions",
  "Defects",
  "Inspections",
  "Plant",
  "Chemicals",
  "RFIs",
  "Meetings",
  "Diary",
  "Programme",
  "Documents",
  "Drawings",
  "Notices",
  "People",
  "Subcontractors",
];

const norm = (s: string) => s.toLowerCase();

/** Wraps the parts of `text` that match the query in <mark>. */
function highlight(text: string, tokens: string[]): ReactNode {
  if (!tokens.length) return text;
  const re = new RegExp(
    `(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "ig",
  );
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded bg-accent/25 px-0.5 text-ink">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/**
 * Search across the whole workspace. Results drop down as you type, grouped by kind, and can be
 * chosen with the mouse or the keyboard (arrows, Enter, Escape). Press / anywhere to jump to it.
 */
export function GlobalSearch({
  className = "",
  placeholder = "Search SWMS, risks, people, incidents",
  onNavigate,
  tone = "bg",
}: {
  className?: string;
  placeholder?: string;
  onNavigate?: () => void;
  tone?: "bg" | "tint";
}) {
  const store = useStore();
  const router = useRouter();
  const uid = useId();
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const index = useMemo<Hit[]>(() => {
    const pn = (id: string) =>
      id === "all"
        ? "Whole business"
        : (store.projects.find((x) => x.id === id)?.name ?? "");
    const hits: Hit[] = [];

    for (const p of store.projects)
      hits.push({
        id: `pj-${p.id}`,
        group: "Projects",
        icon: "building",
        title: p.name,
        sub: `${p.status} · ${p.stage} · ${p.onSite.length} on site`,
        href: "/dashboard/projects",
        text: `${p.name} ${p.address} ${p.client} ${p.manager} ${p.stage} ${p.status} ${p.locations.join(" ")}`,
      });

    for (const x of store.swms)
      hits.push({
        id: `sw-${x.id}`,
        group: "SWMS",
        icon: "file",
        title: x.title,
        sub: `${pn(x.projectId)} · v${x.version} · ${x.status} · signed ${x.signed.length}/${x.required.length}`,
        href: `/dashboard/swms/${x.id}`,
        text: `${x.title} ${pn(x.projectId)} ${x.owner} ${x.status} ${x.steps.map((s) => `${s.task} ${s.hazard}`).join(" ")}`,
      });

    for (const r of store.risks)
      hits.push({
        id: `rk-${r.id}`,
        group: "Risks",
        icon: "alert",
        title: r.hazard,
        sub: `${pn(r.projectId)} · ${rating(r.resL, r.resC)} residual · ${r.status}`,
        href: "/dashboard/risks",
        text: `${r.hazard} ${r.category} ${r.owner} ${pn(r.projectId)} ${r.controls}`,
      });

    for (const p of store.permits)
      hits.push({
        id: `pm-${p.id}`,
        group: "Permits",
        icon: "lock",
        title: p.title,
        sub: `${p.kind} · ${pn(p.projectId)} · ${p.status}`,
        href: "/dashboard/permits",
        text: `${p.title} ${p.kind} ${p.location} ${p.issuedTo} ${pn(p.projectId)} ${p.status}`,
      });

    for (const i of store.incidents)
      hits.push({
        id: `in-${i.id}`,
        group: "Incidents",
        icon: "shield",
        title: i.title,
        sub: `${i.type} · ${pn(i.projectId)} · ${i.status}`,
        href: `/dashboard/incidents/${i.id}`,
        text: `${i.title} ${i.type} ${i.location} ${i.description} ${i.reporter} ${pn(i.projectId)} ${i.status}`,
      });

    for (const a of store.actions)
      hits.push({
        id: `ac-${a.id}`,
        group: "Actions",
        icon: "check",
        title: a.title,
        sub: `${a.status === "Done" ? "Done" : `Due ${fmtDate(a.due)}`} · ${a.owner} · ${pn(a.projectId)}`,
        href: "/dashboard/actions",
        text: `${a.title} ${a.owner} ${a.sourceLabel} ${pn(a.projectId)} ${a.status}`,
      });

    for (const d of store.defects)
      hits.push({
        id: `df-${d.id}`,
        group: "Defects",
        icon: "pencil",
        title: d.title,
        sub: `${d.priority} · ${d.location} · ${d.status}`,
        href: "/dashboard/defects",
        text: `${d.title} ${d.description} ${d.location} ${d.assignee} ${pn(d.projectId)} ${d.priority}`,
      });

    for (const i of store.inspections)
      hits.push({
        id: `is-${i.id}`,
        group: "Inspections",
        icon: "clipboard",
        title: i.title,
        sub: `${pn(i.projectId)} · ${fmtDate(i.date)} · ${i.status}`,
        href: `/dashboard/inspections/${i.id}`,
        text: `${i.title} ${i.inspector} ${pn(i.projectId)} ${i.items.map((x) => x.text).join(" ")}`,
      });

    for (const p of store.plant)
      hits.push({
        id: `pl-${p.id}`,
        group: "Plant",
        icon: "settings",
        title: p.name,
        sub: `${p.kind} · ${pn(p.projectId)} · ${p.status}`,
        href: "/dashboard/plant",
        text: `${p.name} ${p.kind} ${p.serial} ${p.owner} ${pn(p.projectId)} ${p.status}`,
      });

    for (const c of store.chemicals)
      hits.push({
        id: `ch-${c.id}`,
        group: "Chemicals",
        icon: "flag",
        title: c.name,
        sub: `${c.hazard} · ${pn(c.projectId)} · ${c.hasSds ? "SDS on file" : "SDS missing"}`,
        href: "/dashboard/chemicals",
        text: `${c.name} ${c.supplier} ${c.hazard} ${c.location} ${pn(c.projectId)}`,
      });

    for (const r of store.rfis)
      hits.push({
        id: `rf-${r.id}`,
        group: "RFIs",
        icon: "list",
        title: `${r.number} ${r.subject}`,
        sub: `To ${r.to} · ${r.status} · ${pn(r.projectId)}`,
        href: "/dashboard/rfis",
        text: `${r.number} ${r.subject} ${r.question} ${r.to} ${pn(r.projectId)}`,
      });

    for (const t of store.talks)
      hits.push({
        id: `tb-${t.id}`,
        group: "Meetings",
        icon: "users",
        title: t.topic,
        sub: `${t.kind ?? "Toolbox talk"} · ${fmtDate(t.date)} · ${pn(t.projectId)}`,
        href:
          (t.kind ?? "Toolbox talk") === "Toolbox talk"
            ? "/dashboard/toolbox"
            : "/dashboard/consultation",
        text: `${t.topic} ${t.kind ?? "Toolbox talk"} ${t.presenter} ${t.notes} ${pn(t.projectId)}`,
      });

    for (const d of store.diaries)
      hits.push({
        id: `dy-${d.id}`,
        group: "Diary",
        icon: "book",
        title: d.summary.length > 70 ? `${d.summary.slice(0, 70)}…` : d.summary,
        sub: `Diary · ${fmtDate(d.date)} · ${pn(d.projectId)}`,
        href: "/dashboard/diary",
        text: `${d.summary} ${d.workDone} ${d.delays} ${d.safety} ${pn(d.projectId)}`,
      });

    for (const t of store.tasks)
      hits.push({
        id: `pt-${t.id}`,
        group: "Programme",
        icon: "calendar",
        title: t.name,
        sub: `${t.trade} · ${t.progress}% · ${pn(t.projectId)}`,
        href: "/dashboard/programme",
        text: `${t.name} ${t.trade} ${pn(t.projectId)}`,
      });

    for (const d of store.docs)
      hits.push({
        id: `dc-${d.id}`,
        group: "Documents",
        icon: "book",
        title: d.title,
        sub: `${d.category} · v${d.version} · ${pn(d.projectId)}`,
        href: "/dashboard/documents",
        text: `${d.title} ${d.category} ${d.owner} ${pn(d.projectId)}`,
      });

    for (const d of store.drawings)
      hits.push({
        id: `dw-${d.id}`,
        group: "Drawings",
        icon: "file",
        title: `${d.number} ${d.title}`,
        sub: `${d.discipline} · Rev ${d.revisions[0]?.rev} · ${pn(d.projectId)}`,
        href: "/dashboard/drawings",
        text: `${d.number} ${d.title} ${d.discipline} ${pn(d.projectId)}`,
      });

    for (const n of store.notices)
      hits.push({
        id: `nt-${n.id}`,
        group: "Notices",
        icon: "bell",
        title: n.title,
        sub: `${n.priority} · ${fmtDate(n.date)} · ${pn(n.projectId)}`,
        href: "/dashboard/notices",
        text: `${n.title} ${n.body} ${n.priority} ${pn(n.projectId)}`,
      });

    for (const w of store.workers)
      hits.push({
        id: `w-${w.id}`,
        group: "People",
        icon: "id",
        title: w.name,
        sub: `${w.role} · ${w.projects.map(pn).join(", ") || "No project"}`,
        href: "/dashboard/people",
        text: `${w.name} ${w.role} ${w.tickets.map((t) => `${t.kind} ${t.number}`).join(" ")} ${w.projects.map(pn).join(" ")}`,
      });

    for (const v of store.visitors)
      hits.push({
        id: `v-${v.id}`,
        group: "People",
        icon: "user",
        title: v.name,
        sub: `Visitor · ${v.company} · ${pn(v.projectId)}`,
        href: "/dashboard/visitors",
        text: `${v.name} ${v.company} ${v.purpose} ${v.host} visitor`,
      });

    for (const m of store.members)
      hits.push({
        id: `u-${m.id}`,
        group: "People",
        icon: "user",
        title: m.name,
        sub: `${m.role} · team`,
        href: "/dashboard/settings",
        text: `${m.name} ${m.email} ${m.role} team user`,
      });

    for (const x of store.subs)
      hits.push({
        id: `sb-${x.id}`,
        group: "Subcontractors",
        icon: "store",
        title: x.name,
        sub: `${x.trade} · ${x.approved ? "Approved" : "Pending"}`,
        href: "/dashboard/subcontractors",
        text: `${x.name} ${x.trade} ${x.contact} ${x.docs.map((d) => d.kind).join(" ")} subcontractor`,
      });

    return hits;
  }, [store]);

  const tokens = useMemo(() => norm(q).split(/\s+/).filter(Boolean), [q]);

  const results = useMemo<Hit[]>(() => {
    if (!tokens.length)
      return PAGES.slice(0, 8).map((p) => ({
        id: `pg-${p.href}-${p.title}`,
        group: "Jump to",
        icon: p.icon,
        title: p.title,
        href: p.href,
        text: p.title,
      }));
    const score = (h: Hit) => {
      const title = norm(h.title);
      const first = tokens[0];
      return title.startsWith(first) ? 0 : title.includes(first) ? 1 : 2;
    };
    const pageHits: Hit[] = PAGES.map((p) => ({
      id: `pg-${p.href}-${p.title}`,
      group: "Pages",
      icon: p.icon,
      title: p.title,
      href: p.href,
      text: `${p.title} ${p.words}`,
    }));
    const matched = [...pageHits, ...index]
      .filter((h) => {
        const t = norm(h.text);
        return tokens.every((tok) => t.includes(tok));
      })
      .sort((a, b) => score(a) - score(b));
    const out: Hit[] = [];
    for (const g of ORDER)
      out.push(
        ...matched.filter((h) => h.group === g).slice(0, g === "Pages" ? 3 : 4),
      );
    return out.slice(0, 14);
  }, [tokens, index]);

  // keep the highlighted row in range as results change
  const shown = Math.min(active, Math.max(results.length - 1, 0));

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName) &&
        !(e.target as HTMLElement)?.isContentEditable
      ) {
        // only the search that is actually on screen takes the shortcut
        if (!input.current || input.current.offsetParent === null) return;
        e.preventDefault();
        input.current.focus();
        setOpen(true);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const go = (h: Hit) => {
    setOpen(false);
    setQ("");
    input.current?.blur();
    onNavigate?.();
    router.push(h.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && results[shown]) {
        e.preventDefault();
        go(results[shown]);
      }
    } else if (e.key === "Escape") {
      if (q) setQ("");
      else {
        setOpen(false);
        input.current?.blur();
      }
    }
  };

  const listId = `${uid}-list`;
  let lastGroup = "";

  return (
    <div ref={box} className={`relative ${className}`}>
      <label
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm text-ink-soft focus-within:ring-2 focus-within:ring-accent ${
          tone === "tint" ? "bg-tint" : "bg-bg"
        }`}
      >
        <Icon name="search" className="h-4 w-4 shrink-0" />
        <input
          ref={input}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={
            open && results[shown] ? `${uid}-${shown}` : undefined
          }
          aria-autocomplete="list"
          aria-label="Search"
          autoComplete="off"
          spellCheck={false}
          value={q}
          placeholder={placeholder}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="w-full min-w-0 bg-transparent text-ink outline-none placeholder:text-ink-soft"
        />
        {q ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQ("");
              input.current?.focus();
            }}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-line hover:text-ink"
          >
            <Icon name="close" className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden shrink-0 rounded border border-line px-1.5 text-[10px] font-semibold text-ink-soft lg:inline">
            /
          </kbd>
        )}
      </label>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label="Search results"
          data-lenis-prevent
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[min(26rem,70dvh)] min-w-[18rem] overflow-y-auto overscroll-contain rounded-2xl border border-line bg-surface p-1.5 shadow-[0_20px_50px_-12px_rgba(20,30,40,0.28)] sm:min-w-[24rem]"
        >
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-ink-soft">
              Nothing found for “{q.trim()}”. Try a name, a hazard, or a site.
            </p>
          ) : (
            results.map((h, i) => {
              const header = h.group !== lastGroup ? h.group : null;
              lastGroup = h.group;
              return (
                <Fragment key={h.id}>
                  {header && (
                    <p className="px-3 pb-1 pt-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                      {header}
                    </p>
                  )}
                  <button
                    type="button"
                    role="option"
                    id={`${uid}-${i}`}
                    aria-selected={i === shown}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(h)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                      i === shown ? "bg-accent/15" : ""
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-tint text-ink-soft">
                      <Icon name={h.icon} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {highlight(h.title, tokens)}
                      </span>
                      {h.sub && (
                        <span className="block truncate text-xs text-ink-soft">
                          {h.sub}
                        </span>
                      )}
                    </span>
                    {i === shown && (
                      <Icon
                        name="arrow"
                        className="h-4 w-4 shrink-0 text-ink-soft"
                      />
                    )}
                  </button>
                </Fragment>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
