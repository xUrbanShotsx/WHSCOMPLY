/** Attached files live in this browser's IndexedDB, so they survive reloads without a server. */

const DB = "whscomply-files";
const STORE = "files";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => {
      db.close();
      resolve(req.result);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export const putFile = (id: string, file: Blob) =>
  run("readwrite", (s) => s.put(file, id));
export const getFile = (id: string) =>
  run<Blob | undefined>("readonly", (s) => s.get(id));
export const deleteFile = (id: string) => run("readwrite", (s) => s.delete(id));
export const clearFiles = () => run("readwrite", (s) => s.clear());

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ACCEPT = ".pdf,.png,.jpg,.jpeg,.heic,.doc,.docx,.xls,.xlsx,.txt";

export function formatSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Open a stored file in a new tab. Returns false if it is no longer in this browser. */
export async function openFile(fileId: string): Promise<boolean> {
  if (!fileId) return false;
  const blob = await getFile(fileId).catch(() => undefined);
  if (!blob) return false;
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
}

export type Attachment = {
  id: string;
  name: string;
  mime: string;
  size: number;
};

const uidf = () =>
  Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);

/** Stores a file in this browser and returns the small record kept on the item. */
export async function saveAttachment(file: File): Promise<Attachment> {
  if (file.size > MAX_FILE_BYTES)
    throw new Error(`${file.name} is over 10 MB.`);
  const id = uidf();
  await putFile(id, file);
  return { id, name: file.name, mime: file.type, size: file.size };
}
