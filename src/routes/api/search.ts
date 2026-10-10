import { HttpError, handle, json, resolvePath, search } from "~/server/fs";

export const GET = handle(async (request) => {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (q.length < 2) throw new HttpError(400, "Search query must be at least 2 characters");
  return json(await search(resolvePath(url.searchParams.get("path")), q));
});
