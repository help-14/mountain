import { createMiddleware } from "@solidjs/start/middleware";
import { timingSafeEqual } from "node:crypto";

const USER = process.env.MOUNTAIN_USERNAME;
const PASS = process.env.MOUNTAIN_PASSWORD;

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Optional HTTP basic auth, enabled when MOUNTAIN_USERNAME and MOUNTAIN_PASSWORD are set. */
export default createMiddleware([
  async (event, next) => {
    if (USER && PASS) {
      const header = event.req.headers.get("authorization") ?? "";
      const [scheme, encoded] = header.split(" ");
      const [user, ...rest] = scheme === "Basic" && encoded ? Buffer.from(encoded, "base64").toString().split(":") : [];
      if (!user || !safeEqual(user, USER) || !safeEqual(rest.join(":"), PASS)) {
        return new Response("Authentication required", {
          status: 401,
          headers: { "WWW-Authenticate": 'Basic realm="Mountain", charset="UTF-8"' },
        });
      }
    }
    return next();
  },
]);
