import fsp from "node:fs/promises";
import path from "node:path";
import { HttpError, assertNotRoot, exists, handle, json, readJson, resolvePath, statEntry, validateName } from "~/server/fs";

export const POST = handle(
  async (request) => {
    const body = await readJson<{ path: string; name: string }>(request);
    const src = resolvePath(body.path);
    assertNotRoot(src);
    const name = validateName(body.name);
    const target = path.join(path.dirname(src), name);
    if (target === src) return json(await statEntry(src));

    // Allow case-only renames on case-insensitive file systems.
    const caseOnly = target.toLowerCase() === src.toLowerCase();
    if (!caseOnly && (await exists(target))) throw new HttpError(409, `"${name}" already exists`);

    await fsp.rename(src, target);
    return json(await statEntry(target));
  },
  { write: true },
);
