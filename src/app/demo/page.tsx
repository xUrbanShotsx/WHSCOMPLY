import type { Metadata } from "next";
import { Icon } from "@/components/Icons";
import { PageHeader } from "@/components/Sections";
import { breadcrumbs, JsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";
import { DemoForm } from "./DemoForm";

export const metadata: Metadata = {
  title: "Book a Demo",
  description:
    "Book a 30-minute WHSCOMPLY demo. See SWMS, inductions, tickets, incidents and the audit pack on your own sites.",
  alternates: { canonical: "/demo" },
};

export default function Demo() {
  return (
    <>
      <JsonLd
        data={breadcrumbs(SITE_URL, [
          { name: "Home", path: "/" },
          { name: "Book a demo", path: "/demo" },
        ])}
      />
      <PageHeader
        eyebrow="Book a demo"
        title={
          <>
            See WHSCOMPLY on <span className="tape">your</span> sites.
          </>
        }
      >
        Tell us about your business and we&apos;ll walk you through SWMS,
        sign-on, tickets and the audit pack.
      </PageHeader>
      <section className="mx-auto mt-10 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <ul data-reveal className="space-y-4 self-start">
          {[
            "A 30-minute walkthrough tailored to how you build",
            "Your SWMS and site setup, not a generic tour",
            "Answers on migration, roles and audit exports",
          ].map((t) => (
            <li key={t} className="flex items-start gap-3 text-ink">
              <Icon name="check" className="mt-1 h-5 w-5 shrink-0 text-ink" />{" "}
              {t}
            </li>
          ))}
        </ul>
        <DemoForm />
      </section>
    </>
  );
}
