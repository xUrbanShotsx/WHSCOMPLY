"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACCEPT,
  deleteFile,
  formatSize,
  getFile,
  openFile,
  saveAttachment,
  type Attachment,
} from "@/lib/files";
import { Icon } from "../Icons";

/** Small preview for an image attachment, read back from this browser's storage. */
export function Thumb({
  a,
  className = "h-14 w-14",
}: {
  a: Attachment;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let u: string | null = null;
    let live = true;
    if (a.mime.startsWith("image/"))
      getFile(a.id)
        .then((b) => {
          if (b && live) {
            u = URL.createObjectURL(b);
            setUrl(u);
          }
        })
        .catch(() => {});
    return () => {
      live = false;
      if (u) URL.revokeObjectURL(u);
    };
  }, [a.id, a.mime]);

  return (
    <button
      type="button"
      onClick={() => void openFile(a.id)}
      aria-label={`Open ${a.name}`}
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-tint ${className}`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <Icon name="file" className="h-5 w-5 text-ink-soft" />
      )}
    </button>
  );
}

export function AttachmentStrip({ files }: { files?: Attachment[] }) {
  if (!files?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {files.map((f) => (
        <Thumb key={f.id} a={f} />
      ))}
    </div>
  );
}

/** Add and remove files on a record. Files are kept in this browser; the record keeps only their names. */
export function AttachField({
  files,
  onChange,
  label = "Add photos or files",
  accept = `image/*,${ACCEPT}`,
  disabled,
}: {
  files: Attachment[];
  onChange: (next: Attachment[]) => void;
  label?: string;
  accept?: string;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap items-start gap-2">
        {files.map((f) => (
          <div key={f.id} className="relative">
            <Thumb a={f} />
            {!disabled && (
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => {
                  void deleteFile(f.id).catch(() => {});
                  onChange(files.filter((x) => x.id !== f.id));
                }}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-bg shadow"
              >
                <Icon name="close" className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
        {!disabled && (
          <button
            type="button"
            disabled={busy}
            onClick={() => ref.current?.click()}
            className="flex h-14 min-w-14 items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink-soft/50 px-3 text-xs font-semibold text-ink-soft hover:border-ink hover:text-ink disabled:opacity-50"
          >
            <Icon name="plus" className="h-3.5 w-3.5" />{" "}
            {busy ? "Saving" : label}
          </button>
        )}
      </div>
      {files.length > 0 && (
        <p className="mt-1.5 text-[11px] text-ink-soft">
          {files.map((f) => `${f.name} ${formatSize(f.size)}`).join(" · ")}
        </p>
      )}
      {err && (
        <p role="alert" className="mt-1.5 text-xs font-semibold">
          {err}
        </p>
      )}
      <input
        ref={ref}
        type="file"
        multiple
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        onChange={async (e) => {
          const picked = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (!picked.length) return;
          setErr("");
          setBusy(true);
          try {
            const saved: Attachment[] = [];
            for (const f of picked) saved.push(await saveAttachment(f));
            onChange([...files, ...saved]);
          } catch (x) {
            setErr((x as Error).message || "Could not save that file.");
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
