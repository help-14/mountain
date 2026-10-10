import fsp from "node:fs/promises";
import path from "node:path";
import { HttpError, handle, json, resolvePath, statEntry, uniquePath, validateName, writeStreamToFile } from "~/server/fs";

/**
 * Raw-body upload: POST /api/upload?path=/dest&name=sub/folder/file.txt
 * One request per file keeps memory flat, gives per-file progress and lets folders be uploaded.
 */
export const POST = handle(
  async (request) => {
    const url = new URL(request.url);
    const dest = url.searchParams.get("path") ?? "/";
    const rel = (url.searchParams.get("name") ?? "").split("/").filter(Boolean);
    if (rel.length === 0) throw new HttpError(400, "File name is required");
    if (!request.body) throw new HttpError(400, "Empty upload");

    const segments = rel.map(validateName);
    const fileName = segments.pop()!;
    const dirVirtual = path.posix.join(dest, ...segments);
    const dirAbs = resolvePath(dirVirtual);
    await fsp.mkdir(dirAbs, { recursive: true });

    const target = await uniquePath(dirAbs, fileName);
    await writeStreamToFile(request.body, target);
    return json(await statEntry(target), 201);
  },
  { write: true },
);
