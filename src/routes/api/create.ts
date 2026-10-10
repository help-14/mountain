import fsp from "node:fs/promises";
import path from "node:path";
import { HttpError, exists, handle, json, readJson, resolvePath, statEntry, validateName } from "~/server/fs";

type Body = { path: string; name: string; directory?: boolean; content?: string };

export const POST = handle(
  async (request) => {
    const body = await readJson<Body>(request);
    const parent = resolvePath(body.path);
    const target = path.join(parent, validateName(body.name));
    if (await exists(target)) throw new HttpError(409, `"${body.name}" already exists`);

    if (body.directory) await fsp.mkdir(target);
    else await fsp.writeFile(target, typeof body.content === "string" ? body.content : "", { flag: "wx" });

    return json(await statEntry(target), 201);
  },
  { write: true },
);
