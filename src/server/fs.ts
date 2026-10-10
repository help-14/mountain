import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { Zip, ZipDeflate, ZipPassThrough } from "fflate";
import type { FileInfo } from "~/types";

/**
 * Every path the client sends is a "virtual" POSIX path rooted at "/",
 * which maps onto MOUNTAIN_ROOT on disk. Nothing outside the root is reachable.
 */
export const ROOT = path.resolve(process.env.MOUNTAIN_ROOT || os.homedir());
export const READ_ONLY = /^(1|true|yes)$/i.test(process.env.MOUNTAIN_READONLY ?? "");
const ROOT_REAL = fs.existsSync(ROOT) ? fs.realpathSync(ROOT) : ROOT;

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/** Wraps a route handler so thrown errors become JSON error responses. */
export function handle(fn: (request: Request) => Promise<Response>, opts: { write?: boolean } = {}) {
  return async ({ request }: { request: Request }) => {
    try {
      if (opts.write && READ_ONLY) throw new HttpError(403, "Mountain is running in read-only mode");
      return await fn(request);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      const e = err as NodeJS.ErrnoException;
      const status =
        e.code === "ENOENT" ? 404 : e.code === "EEXIST" ? 409 : e.code === "EACCES" || e.code === "EPERM" ? 403 : 500;
      if (status === 500) console.error("[mountain]", err);
      return json({ error: e.message || "Unexpected server error" }, status);
    }
  };
}

export function normalizeVirtual(p: string | null | undefined): string {
  const cleaned = path.posix.normalize("/" + (p ?? "").replace(/\\/g, "/"));
  return cleaned.length > 1 ? cleaned.replace(/\/+$/, "") : "/";
}

function isInside(parent: string, child: string) {
  const rel = path.relative(parent, child);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

/** Resolve a virtual path to an absolute path inside ROOT, following symlinks of existing ancestors. */
export function resolvePath(virtual: string | null | undefined): string {
  const abs = path.join(ROOT, normalizeVirtual(virtual));
  if (!isInside(ROOT, abs)) throw new HttpError(403, "Path is outside of the served directory");

  // Walk up to the nearest existing ancestor and make sure its real location is still inside ROOT.
  let probe = abs;
  while (!fs.existsSync(probe) && probe !== ROOT) probe = path.dirname(probe);
  try {
    const real = fs.realpathSync(probe);
    if (!isInside(ROOT_REAL, real)) throw new HttpError(403, "Path is outside of the served directory");
  } catch (err) {
    if (err instanceof HttpError) throw err;
  }
  return abs;
}

export function toVirtual(abs: string): string {
  return normalizeVirtual(path.relative(ROOT, abs).split(path.sep).join("/"));
}

export function validateName(name: unknown): string {
  if (typeof name !== "string") throw new HttpError(400, "Name is required");
  const trimmed = name.trim();
  if (!trimmed || trimmed === "." || trimmed === "..") throw new HttpError(400, "Name can't be empty");
  if (/[\/\\\0]/.test(trimmed)) throw new HttpError(400, "Name can't contain slashes");
  if (trimmed.length > 255) throw new HttpError(400, "Name is too long");
  return trimmed;
}

export function assertNotRoot(abs: string) {
  if (path.resolve(abs) === ROOT) throw new HttpError(400, "The root folder can't be modified");
}

export async function exists(abs: string) {
  try {
    await fsp.lstat(abs);
    return true;
  } catch {
    return false;
  }
}

/** "report.pdf" -> "report (1).pdf" until the name is free. */
export async function uniquePath(dir: string, name: string): Promise<string> {
  let candidate = path.join(dir, name);
  if (!(await exists(candidate))) return candidate;
  const ext = path.extname(name);
  const base = ext && ext !== name ? name.slice(0, -ext.length) : name;
  for (let i = 1; i < 10_000; i++) {
    candidate = path.join(dir, `${base} (${i})${ext}`);
    if (!(await exists(candidate))) return candidate;
  }
  throw new HttpError(409, "Could not find a free file name");
}

export async function statEntry(abs: string): Promise<FileInfo> {
  const lst = await fsp.lstat(abs);
  let st = lst;
  if (lst.isSymbolicLink()) {
    try {
      st = await fsp.stat(abs);
    } catch {
      // broken link: keep lstat info
    }
  }
  const name = path.basename(abs);
  const directory = st.isDirectory();
  const dot = name.lastIndexOf(".");
  return {
    name,
    size: directory ? 0 : st.size,
    ext: directory || dot <= 0 ? "" : name.slice(dot + 1).toLowerCase(),
    path: toVirtual(abs),
    directory,
    symlink: lst.isSymbolicLink(),
    modified: st.mtimeMs,
    hidden: name.startsWith("."),
  };
}

export async function listDirectory(abs: string, dirsOnly = false): Promise<FileInfo[]> {
  const st = await fsp.stat(abs);
  if (!st.isDirectory()) throw new HttpError(400, "Path is not a folder");
  const entries = await fsp.readdir(abs);
  const infos = await Promise.all(entries.map((e) => statEntry(path.join(abs, e)).catch(() => null)));
  return infos.filter((i): i is FileInfo => !!i && (!dirsOnly || i.directory));
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
}

export function requirePaths(paths: unknown): string[] {
  if (!Array.isArray(paths) || paths.length === 0 || paths.some((p) => typeof p !== "string"))
    throw new HttpError(400, "At least one path is required");
  return paths as string[];
}

/** Copy or move a list of virtual paths into a destination folder. */
export async function transfer(paths: string[], destination: string, mode: "copy" | "move") {
  const destAbs = resolvePath(destination);
  const destStat = await fsp.stat(destAbs);
  if (!destStat.isDirectory()) throw new HttpError(400, "Destination is not a folder");

  const results: string[] = [];
  for (const p of paths) {
    const src = resolvePath(p);
    assertNotRoot(src);
    if (isInside(src, destAbs)) throw new HttpError(400, `Can't ${mode} "${path.basename(src)}" into itself`);
    if (mode === "move" && path.dirname(src) === destAbs) {
      results.push(toVirtual(src));
      continue;
    }
    const target = await uniquePath(destAbs, path.basename(src));
    if (mode === "copy") {
      await fsp.cp(src, target, { recursive: true, errorOnExist: true, force: false, verbatimSymlinks: true });
    } else {
      try {
        await fsp.rename(src, target);
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== "EXDEV") throw err;
        await fsp.cp(src, target, { recursive: true, verbatimSymlinks: true });
        await fsp.rm(src, { recursive: true, force: true });
      }
    }
    results.push(toVirtual(target));
  }
  return results;
}

async function* walkFiles(abs: string, prefix: string): AsyncGenerator<{ abs: string; name: string; dir?: boolean }> {
  const st = await fsp.lstat(abs);
  if (st.isSymbolicLink()) return;
  if (st.isDirectory()) {
    const children = await fsp.readdir(abs);
    // keep empty folders in the archive
    if (children.length === 0) yield { abs, name: `${prefix}/`, dir: true };
    for (const child of children) {
      yield* walkFiles(path.join(abs, child), prefix ? `${prefix}/${child}` : child);
    }
  } else if (st.isFile()) {
    yield { abs, name: prefix };
  }
}

/** Streams a zip archive containing the given absolute paths (files or folders). */
export function zipStream(sources: string[]): ReadableStream<Uint8Array> {
  let zip: Zip;
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      zip = new Zip((err, chunk, final) => {
        if (err) return controller.error(err);
        controller.enqueue(chunk);
        if (final) controller.close();
      });
      try {
        for (const src of sources) {
          for await (const file of walkFiles(src, path.basename(src))) {
            if (file.dir) {
              const dirEntry = new ZipPassThrough(file.name);
              zip.add(dirEntry);
              dirEntry.push(new Uint8Array(0), true);
              continue;
            }
            const entry = new ZipDeflate(file.name, { level: 6 });
            zip.add(entry);
            for await (const chunk of fs.createReadStream(file.abs)) entry.push(chunk as Uint8Array);
            entry.push(new Uint8Array(0), true);
          }
        }
        zip.end();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

export async function writeStreamToFile(stream: ReadableStream<Uint8Array>, abs: string) {
  const out = fs.createWriteStream(abs, { flags: "wx" });
  try {
    await new Promise<void>((resolve, reject) => {
      Readable.fromWeb(stream as any)
        .on("error", reject)
        .pipe(out)
        .on("error", reject)
        .on("finish", resolve);
    });
  } catch (err) {
    out.destroy();
    await fsp.rm(abs, { force: true });
    throw err;
  }
}

export async function search(rootAbs: string, query: string, limit = 300, timeoutMs = 4000) {
  const needle = query.toLowerCase();
  const results: FileInfo[] = [];
  const deadline = Date.now() + timeoutMs;
  const queue = [rootAbs];
  const SKIP = new Set(["node_modules", ".git", ".cache", "Library"]);

  while (queue.length && results.length < limit && Date.now() < deadline) {
    const dir = queue.shift()!;
    let entries: fs.Dirent[];
    try {
      entries = await fsp.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      if (entry.name.toLowerCase().includes(needle)) {
        const info = await statEntry(abs).catch(() => null);
        if (info) results.push(info);
        if (results.length >= limit) break;
      }
      if (entry.isDirectory() && !SKIP.has(entry.name)) queue.push(abs);
    }
  }
  return { items: results, truncated: queue.length > 0 };
}

export function contentDisposition(type: "inline" | "attachment", name: string) {
  const ascii = name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return `${type}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

const MIME: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp",
  svg: "image/svg+xml", avif: "image/avif", bmp: "image/bmp", ico: "image/x-icon",
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", m4v: "video/mp4", ogv: "video/ogg",
  mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", oga: "audio/ogg", m4a: "audio/mp4",
  flac: "audio/flac", aac: "audio/aac", pdf: "application/pdf", json: "application/json",
  txt: "text/plain", md: "text/plain", csv: "text/plain", log: "text/plain",
};

export function mimeOf(name: string) {
  const ext = path.extname(name).slice(1).toLowerCase();
  // Never serve active content (html, svg scripts) inline from the user's disk as same-origin HTML.
  return MIME[ext] ?? "application/octet-stream";
}
