import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app/AppShell";
import { DemoStoreProvider } from "@/components/app/DemoStore";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | WHSCOMPLY" },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The dashboard reads today's date and the browser's saved workspace, so it renders per visit, not at build time.
  return (
    <Suspense
      fallback={
        <p className="p-10 text-center text-sm text-ink-soft">
          Loading your workspace
        </p>
      }
    >
      <DemoStoreProvider>
        <AppShell>{children}</AppShell>
      </DemoStoreProvider>
    </Suspense>
  );
}
