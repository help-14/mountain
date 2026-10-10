import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { HttpError, ROOT, contentDisposition, handle, mimeOf, resolvePath, zipStream } from "~/server/fs";

const SAFE_HEADERS = {
  // Files come from the user's disk: never let them run scripts on this origin.
  "Content-Security-Policy": "sandbox; default-src 'none'; img-src 'self' data:; media-src 'self'; style-src 'unsafe-inline'",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "private, no-cache",
};

export const GET = handle(async (request) => {
  const url = new URL(request.url);
  const paths = url.searchParams.getAll("path");
  if (paths.length === 0) throw new HttpError(400, "Path parameter is required");
  const inline = url.searchParams.get("inline") === "1";
  const sources = paths.map(resolvePath);

  if (sources.length === 1) {
    const abs = sources[0];
    const st = await fsp.stat(abs);
    if (st.isFile()) {
      const name = path.basename(abs);
      const headers = new Headers({
        ...SAFE_HEADERS,
        "Content-Type": inline ? mimeOf(name) : "application/octet-stream",
        "Content-Disposition": contentDisposition(inline ? "inline" : "attachment", name),
        "Accept-Ranges": "bytes",
        "Last-Modified": st.mtime.toUTCString(),
      });

      // Range support so videos and audio can seek.
      const range = request.headers.get("range")?.match(/^bytes=(\d*)-(\d*)$/);
      if (range && st.size > 0) {
        const start = range[1] ? Number(range[1]) : Math.max(0, st.size - Number(range[2]));
        const end = range[1] && range[2] ? Math.min(Number(range[2]), st.size - 1) : st.size - 1;
        if (start > end || start >= st.size) {
          return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${st.size}` } });
        }
        headers.set("Content-Range", `bytes ${start}-${end}/${st.size}`);
        headers.set("Content-Length", String(end - start + 1));
        const stream = Readable.toWeb(fs.createReadStream(abs, { start, end })) as ReadableStream;
        return new Response(stream, { status: 206, headers });
      }

      headers.set("Content-Length", String(st.size));
      return new Response(Readable.toWeb(fs.createReadStream(abs)) as ReadableStream, { headers });
    }
  }

  const archiveName =
    sources.length === 1 ? `${path.basename(sources[0]) || path.basename(ROOT)}.zip` : "mountain-download.zip";
  return new Response(zipStream(sources), {
    headers: {
      ...SAFE_HEADERS,
      "Content-Type": "application/zip",
      "Content-Disposition": contentDisposition("attachment", archiveName),
    },
  });
});
