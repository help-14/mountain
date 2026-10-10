import fsp from "node:fs/promises";
import { HttpError, handle, json, resolvePath } from "~/server/fs";

const LIMIT = 256 * 1024;

export const GET = handle(async (request) => {
  const abs = resolvePath(new URL(request.url).searchParams.get("path"));
  const st = await fsp.stat(abs);
  if (!st.isFile()) throw new HttpError(400, "Path is not a file");

  const handleFile = await fsp.open(abs, "r");
  try {
    const buffer = Buffer.alloc(Math.min(LIMIT, st.size));
    await handleFile.read(buffer, 0, buffer.length, 0);
    if (buffer.includes(0)) return json({ binary: true, text: "", truncated: false });
    return json({ binary: false, text: buffer.toString("utf8"), truncated: st.size > LIMIT });
  } finally {
    await handleFile.close();
  }
});
