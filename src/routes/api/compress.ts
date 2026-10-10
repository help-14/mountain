import {
  handle,
  json,
  readJson,
  requirePaths,
  resolvePath,
  statEntry,
  uniquePath,
  validateName,
  writeStreamToFile,
  zipStream,
} from "~/server/fs";

type Body = { paths: string[]; destination: string; name: string };

export const POST = handle(
  async (request) => {
    const body = await readJson<Body>(request);
    const sources = requirePaths(body.paths).map(resolvePath);
    let name = validateName(body.name);
    if (!name.toLowerCase().endsWith(".zip")) name += ".zip";
    const target = await uniquePath(resolvePath(body.destination), name);
    await writeStreamToFile(zipStream(sources), target);
    return json(await statEntry(target), 201);
  },
  { write: true },
);
