import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icons";
import { Magnetic } from "./Magnetic";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-6 pt-16 sm:px-8 sm:pt-24">
      <div data-load>
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <h1
        data-load
        className="mt-5 max-w-4xl font-display text-[clamp(2.4rem,5.6vw,4.8rem)] font-bold leading-[1] tracking-tight"
      >
        {title}
      </h1>
      <p data-load className="mt-7 max-w-xl text-lg text-ink-soft">
        {children}
      </p>
    </section>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "ink",
}: {
  href: string;
  children: ReactNode;
  variant?: "ink" | "ghost" | "light";
}) {
  const styles = {
    ink: "bg-ink text-bg hover:bg-ink/85",
    light: "bg-bg text-ink hover:bg-surface",
    ghost: "border border-ink/30 hover:border-ink hover:bg-tint",
  }[variant];
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold transition-colors duration-200 ${styles}`}
    >
      {children}{" "}
      {variant !== "ghost" && <Icon name="arrow" className="h-4 w-4" />}
    </Link>
  );
}

export function CtaBand() {
  return (
    <section className="mx-auto mt-28 max-w-6xl px-5 sm:px-8">
      <div
        data-reveal
        className="relative overflow-hidden rounded-[2rem] bg-accent text-ink px-7 py-16 sm:px-14 sm:py-20"
      >
        <h2 className="max-w-3xl font-display text-[clamp(2.2rem,5vw,4.2rem)] font-bold leading-[1] tracking-tight">
          Find the gaps before an inspector does.
        </h2>
        <p className="mt-5 max-w-lg text-lg">
          Thirty minutes, your SWMS and your site setup. Bring one messy project
          and we will clear it live.
        </p>
        <div className="mt-9">
          <Magnetic>
            <ButtonLink href="mailto:hello@whscomply.com">Book a demo</ButtonLink>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
