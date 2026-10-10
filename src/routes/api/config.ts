import path from "node:path";
import { READ_ONLY, ROOT, handle, json } from "~/server/fs";

export const GET = handle(async () => json({ readOnly: READ_ONLY, rootName: path.basename(ROOT) || "/" }));
