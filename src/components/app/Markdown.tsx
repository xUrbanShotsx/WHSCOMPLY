import type { ReactNode } from "react";

/** Inline **bold** and `code`. Everything else is plain text, so model output can never inject markup. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4)
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2)
      return (
        <code
          key={i}
          className="rounded bg-tint px-1 py-0.5 font-mono text-[0.85em]"
        >
          {part.slice(1, -1)}
        </code>
      );
    return part;
  });
}

type Block = { kind: "p" | "ul" | "ol" | "h"; lines: string[] };

function parse(src: string): Block[] {
  const blocks: Block[] = [];
  let cur: Block | null = null;
  const push = (kind: Block["kind"], line: string) => {
    if (cur && cur.kind === kind) cur.lines.push(line);
    else {
      cur = { kind, lines: [line] };
      blocks.push(cur);
    }
  };
  for (const raw of src.split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      cur = null;
      continue;
    }
    if (/^#{1,4}\s+/.test(line)) {
      cur = null;
      blocks.push({ kind: "h", lines: [line.replace(/^#{1,4}\s+/, "")] });
    } else if (/^\s*[-*]\s+/.test(line))
      push("ul", line.replace(/^\s*[-*]\s+/, ""));
    else if (/^\s*\d+[.)]\s+/.test(line))
      push("ol", line.replace(/^\s*\d+[.)]\s+/, ""));
    else push("p", line); // lines of one paragraph stay together
  }
  return blocks;
}

export function Markdown({ text }: { text: string }) {
  return (
    <div className="space-y-3 text-[15px] leading-relaxed">
      {parse(text).map((b, i) => {
        if (b.kind === "h")
          return (
            <p key={i} className="font-display text-base font-extrabold">
              {inline(b.lines[0])}
            </p>
          );
        if (b.kind === "ul")
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {b.lines.map((l, j) => (
                <li key={j}>{inline(l)}</li>
              ))}
            </ul>
          );
        if (b.kind === "ol")
          return (
            <ol key={i} className="list-decimal space-y-1 pl-5">
              {b.lines.map((l, j) => (
                <li key={j}>{inline(l)}</li>
              ))}
            </ol>
          );
        return <p key={i}>{inline(b.lines.join(" "))}</p>;
      })}
    </div>
  );
}
