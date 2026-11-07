"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/Icons";
import { useStore } from "@/components/app/DemoStore";
import {
  Avatar,
  btnDark,
  btnLight,
  Card,
  CardHead,
  Field,
  field,
  PageHeading,
  Pill,
  TabBar,
} from "@/components/app/ui";
import { ROLES, type Role, type Settings } from "@/lib/data";

const TABS = ["Company", "Team", "Notifications"] as const;

const NOTIFY: { key: keyof Settings["notify"]; label: string; sub: string }[] =
  [
    {
      key: "tickets",
      label: "Tickets and licences",
      sub: "White cards and high risk work licences nearing expiry",
    },
    {
      key: "insurances",
      label: "Subcontractor documents",
      sub: "Insurances, WorkCover and licences nearing expiry",
    },
    {
      key: "actions",
      label: "Corrective actions",
      sub: "Actions that are overdue or due this week",
    },
    {
      key: "incidents",
      label: "Open incidents",
      sub: "Incidents that have not been closed out",
    },
  ];

export default function SettingsPage() {
  const s = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Company");
  const [saved, setSaved] = useState(false);

  const saveCompany = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    s.updateCompany({
      name: String(d.get("name")),
      abn: String(d.get("abn")),
      email: String(d.get("email")),
      phone: String(d.get("phone")),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const invite = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    s.inviteMember({
      name: String(d.get("name")),
      email: String(d.get("email")),
      role: String(d.get("role")) as Role,
    });
    form.reset();
  };

  return (
    <>
      <PageHeading
        title="Settings"
        sub="Your business, who can use WHSCOMPLY, and what you are reminded about."
      />
      <TabBar
        label="Settings"
        value={tab}
        options={[...TABS]}
        onChange={setTab}
      />

      {tab === "Company" && (
        <Card className="max-w-2xl">
          <CardHead title="Business details" sub="Shown on audit packs" />
          <form
            onSubmit={saveCompany}
            className="grid gap-4 p-5 sm:grid-cols-2"
          >
            <Field label="Business name" className="sm:col-span-2">
              <input
                name="name"
                required
                defaultValue={s.settings.company.name}
                className={field}
              />
            </Field>
            <Field label="ABN">
              <input
                name="abn"
                defaultValue={s.settings.company.abn}
                className={field}
              />
            </Field>
            <Field label="Phone">
              <input
                name="phone"
                defaultValue={s.settings.company.phone}
                className={field}
              />
            </Field>
            <Field label="Safety contact email" className="sm:col-span-2">
              <input
                name="email"
                type="email"
                defaultValue={s.settings.company.email}
                className={field}
              />
            </Field>
            <div className="flex items-center gap-3 sm:col-span-2">
              <button type="submit" className={btnDark}>
                Save changes
              </button>
              {saved && (
                <span role="status" className="text-sm text-ink-soft">
                  Saved
                </span>
              )}
            </div>
          </form>
          <div className="border-t border-line bg-bg px-5 py-4">
            <p className="text-sm font-semibold">Demo workspace</p>
            <p className="mt-0.5 text-xs text-ink-soft">
              Changes are saved in this browser only. Reset to return to the
              starting data.
            </p>
            <button
              type="button"
              onClick={() =>
                window.confirm(
                  "Reset the demo workspace to its starting data?",
                ) && s.resetDemo()
              }
              className={`${btnLight} mt-3`}
            >
              Reset demo
            </button>
          </div>
        </Card>
      )}

      {tab === "Team" && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHead
              title="People with access"
              sub="Roles decide what each person can see and change"
            />
            <ul>
              {s.members.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 last:border-0"
                >
                  <Avatar
                    initials={m.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                    tone={1}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {m.name}
                    </span>
                    <span className="block truncate text-xs text-ink-soft">
                      {m.email} ·{" "}
                      {m.status === "Invited"
                        ? "Invited"
                        : `active ${m.lastActive.toLowerCase()}`}
                    </span>
                  </span>
                  {m.role === "Owner" ? (
                    <Pill tone="solid">Owner</Pill>
                  ) : (
                    <>
                      <select
                        aria-label={`Role for ${m.name}`}
                        value={m.role}
                        onChange={(e) =>
                          s.updateMember(m.id, { role: e.target.value as Role })
                        }
                        className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold"
                      >
                        {ROLES.filter((r) => r !== "Owner").map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        aria-label={`Remove ${m.name}`}
                        onClick={() =>
                          window.confirm(`Remove ${m.name}?`) &&
                          s.removeMember(m.id)
                        }
                        className="text-ink-soft hover:text-ink"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="self-start">
            <CardHead
              title="Invite someone"
              sub="Inspectors get a free, read-only account"
            />
            <form onSubmit={invite} className="grid gap-4 p-5">
              <Field label="Full name">
                <input name="name" required className={field} />
              </Field>
              <Field label="Email">
                <input name="email" type="email" required className={field} />
              </Field>
              <Field label="Role">
                <select
                  name="role"
                  defaultValue="Site manager"
                  className={field}
                >
                  {ROLES.filter((r) => r !== "Owner").map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <button type="submit" className={btnDark}>
                Send invite
              </button>
            </form>
          </Card>
        </div>
      )}

      {tab === "Notifications" && (
        <Card className="max-w-2xl">
          <CardHead
            title="What you are reminded about"
            sub="Shown in the bell and on the dashboard"
          />
          <ul>
            {NOTIFY.map((n) => (
              <li
                key={n.key}
                className="flex items-center gap-4 border-b border-line px-5 py-4"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{n.label}</span>
                  <span className="block text-xs text-ink-soft">{n.sub}</span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={s.settings.notify[n.key]}
                  aria-label={n.label}
                  onClick={() =>
                    s.setNotify({ [n.key]: !s.settings.notify[n.key] })
                  }
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${s.settings.notify[n.key] ? "bg-ink" : "bg-line"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-all ${s.settings.notify[n.key] ? "left-[1.375rem]" : "left-0.5"}`}
                  />
                </button>
              </li>
            ))}
          </ul>
          <div className="px-5 py-4">
            <Field label="Warn me before something expires">
              <select
                value={s.settings.warnDays}
                onChange={(e) => s.setWarnDays(Number(e.target.value))}
                className={field}
              >
                {[14, 30, 45, 60, 90].map((d) => (
                  <option key={d} value={d}>
                    {d} days
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>
      )}
    </>
  );
}
