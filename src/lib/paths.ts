export function joinPath(...parts: string[]) {
  const joined = parts.join("/").replace(/\/+/g, "/")
  return normalizePath(joined)
}

export function normalizePath(p: string) {
  const segments: string[] = []
  for (const s of p.split("/")) {
    if (!s || s === ".") continue
    if (s === "..") segments.pop()
    else segments.push(s)
  }
  return "/" + segments.join("/")
}

export function parentPath(p: string) {
  const n = normalizePath(p)
  if (n === "/") return "/"
  return n.slice(0, n.lastIndexOf("/")) || "/"
}

export function baseName(p: string) {
  const n = normalizePath(p)
  return n === "/" ? "" : n.slice(n.lastIndexOf("/") + 1)
}

export function pathSegments(p: string) {
  return normalizePath(p).split("/").filter(Boolean)
}

/** True when `child` equals `parent` or lives somewhere under it. */
export function isWithin(parent: string, child: string) {
  const a = normalizePath(parent)
  const b = normalizePath(child)
  return a === b || b.startsWith(a === "/" ? "/" : a + "/")
}

export function splitExtension(name: string): [string, string] {
  const dot = name.lastIndexOf(".")
  if (dot <= 0) return [name, ""]
  return [name.slice(0, dot), name.slice(dot)]
}
