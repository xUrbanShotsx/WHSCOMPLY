"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "./Icons";

const links = [
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/solutions", label: "Solutions" },
  { href: "/resources", label: "Resources" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pill = scrolled && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ease-out ${scrolled ? "px-3" : "px-0"}`}
    >
      <div
        className={`mx-auto transition-all duration-500 ease-out ${
          pill
            ? "mt-3 max-w-4xl rounded-full border border-line bg-surface/80 shadow-[0_12px_40px_-12px_oklch(0.24_0.05_258/0.28)] backdrop-blur-md"
            : "mt-0 max-w-[100vw] rounded-none border border-transparent border-b-line bg-surface shadow-none"
        }`}
      >
        <nav
          aria-label="Main"
          className={`mx-auto flex max-w-6xl items-center justify-between transition-all duration-500 ${
            pill ? "h-16 gap-4 px-6" : "h-20 gap-4 px-2 sm:h-24 sm:px-8"
          }`}
        >
          <Link
            href="/"
            onClick={() => setOpen(false)}
            aria-label="WHSCOMPLY home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="WHSCOMPLY"
              width={427}
              height={63}
              className={`w-auto transition-all duration-500 ${pill ? "h-6" : "h-7 sm:h-9"}`}
            />
          </Link>

          <ul className="hidden items-center gap-6 whitespace-nowrap lg:gap-8 md:flex">
            {links.map((l) => {
              const active = pathname.startsWith(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative py-1 font-medium transition-all duration-500 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:bg-accent after:transition-transform after:duration-200 ${
                      active
                        ? "after:scale-x-100"
                        : "after:scale-x-0 hover:after:scale-x-100"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              href="https://auth.briesa.com/login"
              className={`whitespace-nowrap rounded-full border border-line font-semibold transition-all duration-500 hover:bg-tint ${pill ? "px-5 py-2 text-sm" : "px-6 py-2.5 text-base"}`}
            >
              Login
            </Link>
            <Link
              href="https://auth.briesa.com/signup"
              className={`hidden whitespace-nowrap rounded-full bg-ink font-semibold text-bg transition-all duration-500 hover:bg-ink/85 sm:inline-block ${pill ? "px-5 py-2 text-sm" : "px-6 py-2.5 text-base"}`}
            >
              Sign up
            </Link>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
            >
              <Icon name={open ? "close" : "menu"} className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-3 top-full mt-2 rounded-3xl border border-line bg-surface p-5 shadow-xl md:hidden"
        >
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-line py-4 font-display text-2xl font-bold"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              href="https://auth.briesa.com/login"
              onClick={() => setOpen(false)}
              className="rounded-full border border-line py-3 text-center font-semibold"
            >
              Login
            </Link>
            <Link
              href="https://auth.briesa.com/signup"
              onClick={() => setOpen(false)}
              className="rounded-full bg-ink py-3 text-center font-semibold text-bg"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
