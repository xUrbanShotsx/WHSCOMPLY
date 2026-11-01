import type { Metadata } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import { Motion } from "@/components/Motion";
import Link from "next/link";
import "./globals.css";

const sans = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});
const mono = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "WHSCOMPLY | WHS Compliance Software for Builders",
  description:
    "WHSCOMPLY keeps builders site-ready: SWMS, inductions, licences, incidents and subcontractor paperwork in one place, with an audit pack on demand.",
};

const links = [
  ["Features", "#features"],
  ["How it works", "#how"],
  ["Audit pack", "#audit"],
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')",
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <Motion />
        <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-surface/90 backdrop-blur-md">
          <nav
            aria-label="Main"
            className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-20 sm:px-8"
          >
            <Link
              href="/"
              aria-label="WHSCOMPLY home"
              className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight sm:text-2xl"
            >
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-sm text-ink"
              >
                W
              </span>
              WHSCOMPLY
            </Link>
            <ul className="hidden items-center gap-8 md:flex">
              {links.map(([label, href]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="font-medium transition-colors hover:text-ink-soft"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="#book"
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink/85 sm:text-base"
            >
              Book a demo
            </a>
          </nav>
        </header>
        <main className="flex-1 pt-16 sm:pt-20">{children}</main>
        <footer className="mt-28 overflow-hidden bg-ink text-bg">
          <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8">
            <div className="flex flex-col justify-between gap-10 md:flex-row">
              <p className="max-w-sm font-display text-2xl font-semibold leading-snug">
                Everyone on site, signed on and accounted for.
              </p>
              <ul className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
                {links.map(([label, href]) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="text-bg/75 transition-colors hover:text-accent"
                    >
                      {label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#book"
                    className="text-bg/75 transition-colors hover:text-accent"
                  >
                    Book a demo
                  </a>
                </li>
              </ul>
            </div>
            <p
              aria-hidden="true"
              className="mt-14 select-none font-display text-[clamp(3rem,14vw,12rem)] font-extrabold leading-[0.8] tracking-tighter text-bg/10"
            >
              WHSCOMPLY
            </p>
          </div>
          <div className="border-t border-bg/15 py-5 text-center font-mono text-xs uppercase tracking-widest text-bg/60">
            © 2026 WHSCOMPLY
          </div>
        </footer>
      </body>
    </html>
  );
}
