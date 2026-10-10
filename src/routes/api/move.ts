import { handle, json, readJson, requirePaths, transfer } from "~/server/fs";

export const POST = handle(
  async (request) => {
    const body = await readJson<{ paths: string[]; destination: string }>(request);
    const paths = await transfer(requirePaths(body.paths), body.destination, "move");
    return json({ paths });
  },
  { write: true },
);
