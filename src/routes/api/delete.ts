import fsp from "node:fs/promises";
import { assertNotRoot, handle, json, readJson, requirePaths, resolvePath } from "~/server/fs";

export const POST = handle(
  async (request) => {
    const paths = requirePaths((await readJson<{ paths: string[] }>(request)).paths);
    const targets = paths.map((p) => {
      const abs = resolvePath(p);
      assertNotRoot(abs);
      return abs;
    });
    for (const abs of targets) await fsp.rm(abs, { recursive: true, force: true });
    return json({ deleted: paths.length });
  },
  { write: true },
);
