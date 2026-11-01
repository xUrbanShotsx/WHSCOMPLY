import type { Faq } from "@/lib/content";

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {faqs.map((f) => (
        <details key={f.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-xl font-bold">
            {f.q}
            <span
              aria-hidden="true"
              className="font-mono text-2xl transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 max-w-2xl text-ink-soft">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
