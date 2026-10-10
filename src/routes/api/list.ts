import { handle, json, listDirectory, normalizeVirtual, resolvePath } from "~/server/fs";

export const GET = handle(async (request) => {
  const url = new URL(request.url);
  const path = normalizeVirtual(url.searchParams.get("path"));
  const items = await listDirectory(resolvePath(path), url.searchParams.get("dirs") === "1");
  return json({ path, items });
});
