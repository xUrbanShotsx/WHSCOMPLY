import type { Metadata, Viewport } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import { Motion } from "@/components/Motion";
import { Suspense } from "react";
import { SiteChrome } from "@/components/SiteChrome";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { states, topics } from "@/lib/content";
import { JsonLd } from "@/lib/jsonld";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "WHSCOMPLY | WHS Compliance Software for Builders",
    template: "%s | WHSCOMPLY",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "WHS compliance software",
    "construction WHS software",
    "SWMS software",
    "site induction app",
    "white card tracking",
    "builder safety software",
    "subcontractor prequalification",
    "incident reporting construction",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_AU",
    url: "/",
    title: "WHSCOMPLY | WHS Compliance Software for Builders",
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "WHSCOMPLY | WHS Compliance Software for Builders",
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#ff804a" };

const links = [
  ["Solutions", "/solutions"],
  ["Pricing", "/pricing"],
  ["About", "/about"],
  ["Resources", "/resources"],
  ["Demo dashboard", "/dashboard"],
  ["Login", "https://auth.briesa.com/login"],
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-AU"
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
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": `${SITE_URL}/#org`,
                name: SITE_NAME,
                url: SITE_URL,
                logo: `${SITE_URL}/logo.svg`,
                areaServed: { "@type": "Country", name: "Australia" },
              },
              {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#site`,
                url: SITE_URL,
                name: SITE_NAME,
                inLanguage: "en-AU",
                publisher: { "@id": `${SITE_URL}/#org` },
              },
            ],
          }}
        />
        <Suspense fallback={null}>
          <Motion />
        </Suspense>
        <Suspense fallback={null}>
          <SiteChrome
            nav={<Navbar />}
            footer={
              <footer className="mt-28 overflow-hidden bg-ink text-bg">
                <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8">
                  <div className="flex flex-col justify-between gap-10 md:flex-row">
                    <p className="max-w-sm font-display text-2xl font-semibold leading-snug">
                      Everyone on site, signed on and accounted for.
                    </p>
                    <ul className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
                      {links.map(([label, href]) => (
                        <li key={href}>
                          <Link
                            href={href}
                            className="text-bg/75 transition-colors hover:text-accent"
                          >
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <nav
                    aria-label="Footer"
                    className="mt-14 grid gap-10 border-t border-bg/15 pt-10 text-sm sm:grid-cols-2"
                  >
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest text-bg/60">
                        Solutions
                      </p>
                      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                        {topics.map((t) => (
                          <li key={t.slug}>
                            <Link
                              href={`/solutions/${t.slug}`}
                              className="text-bg/75 transition-colors hover:text-accent"
                            >
                              {t.nav}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest text-bg/60">
                        <Link href="/states" className="hover:text-accent">
                          By state
                        </Link>
                      </p>
                      <ul className="mt-4 grid grid-cols-2 gap-2">
                        {states.map((st) => (
                          <li key={st.slug}>
                            <Link
                              href={`/states/${st.slug}`}
                              className="text-bg/75 transition-colors hover:text-accent"
                            >
                              {st.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </nav>
                  <p
                    aria-hidden="true"
                    className="mt-14 select-none font-display text-[clamp(3rem,14vw,12rem)] font-extrabold leading-[0.8] tracking-tighter text-bg/10"
                  >
                    WHSCOMPLY
                  </p>
                </div>
                <div className="border-t border-bg/15 py-5 text-center font-mono text-xs uppercase tracking-widest text-bg/60">
                  © 2026 WHSCOMPLY. Powered by Briesa.
                </div>
              </footer>
            }
          >
            {children}
          </SiteChrome>
        </Suspense>
      </body>
    </html>
  );
}
