"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Marketing pages get the navbar and footer; the app dashboard brings its own shell. */
export function SiteChrome({
  nav,
  footer,
  children,
}: {
  nav: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const inApp = usePathname().startsWith("/dashboard");
  if (inApp) return <main className="flex-1">{children}</main>;
  return (
    <>
      {nav}
      <main className="flex-1 pt-20 sm:pt-24">{children}</main>
      {footer}
    </>
  );
}
