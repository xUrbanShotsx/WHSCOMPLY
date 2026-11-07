import type { AiFile, AiTask } from "./ai-types";

export type AiOutcome<T> =
  { ok: true; data: T } | { ok: false; code: string; message: string };

export async function callAi<T>(
  task: AiTask,
  input: Record<string, unknown>,
  file?: AiFile,
): Promise<AiOutcome<T>> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, input, file }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      result?: T;
      error?: string;
      message?: string;
    };
    if (!res.ok || body.result === undefined)
      return {
        ok: false,
        code: body.error ?? "error",
        message: body.message ?? "The AI could not finish that. Try again.",
      };
    return { ok: true, data: body.result };
  } catch {
    return {
      ok: false,
      code: "network",
      message: "Could not reach the AI. Check your connection and try again.",
    };
  }
}

const toB64 = (buf: ArrayBuffer) => {
  let s = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000)
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};

/** Photos are shrunk to 1600 px so phone pictures upload quickly. PDFs are sent as they are. */
export async function toAiFile(file: File): Promise<AiFile> {
  if (file.type === "application/pdf") {
    if (file.size > 4_000_000) throw new Error("That PDF is over 4 MB.");
    return {
      mediaType: file.type,
      data: toB64(await file.arrayBuffer()),
      name: file.name,
    };
  }
  if (!file.type.startsWith("image/"))
    throw new Error("Choose a photo or a PDF.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const url = canvas.toDataURL("image/jpeg", 0.85);
  return {
    mediaType: "image/jpeg",
    data: url.split(",")[1] ?? "",
    name: file.name,
  };
}
