// Set NEXT_PUBLIC_SITE_URL in the host's env vars to the live domain.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://whscomply.com"
).replace(/\/$/, "");
export const SITE_NAME = "WHSCOMPLY";
export const CONTACT_EMAIL = "hello@whscomply.com";
export const LAST_UPDATED = "2026-11-01";
export const DEFAULT_DESCRIPTION =
  "WHS compliance software for Australian builders: SWMS, site inductions, white cards and licences, subcontractor prequalification, incident reports and a ready audit pack.";
