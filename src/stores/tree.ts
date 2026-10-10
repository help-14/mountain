import { createStore, produce } from "solid-js/store"
import { api } from "~/lib/api"
import { normalizePath, pathSegments } from "~/lib/paths"
import type { FileInfo } from "~/types"

type Node = { children: FileInfo[] | null; expanded: boolean; loading: boolean; error?: string }

const [nodes, setNodes] = createStore<Record<string, Node>>({ "/": { children: null, expanded: true, loading: false } })
export { nodes }

const ensure = (path: string) => {
  if (!nodes[path]) setNodes(path, { children: null, expanded: false, loading: false })
}

export async function loadNode(path: string) {
  path = normalizePath(path)
  ensure(path)
  setNodes(path, { loading: true, error: undefined })
  try {
    const res = await api.list(path, true)
    setNodes(path, { children: res.items, loading: false })
  } catch (err) {
    setNodes(path, { loading: false, error: (err as Error).message, children: [] })
  }
}

export function toggleNode(path: string, expanded?: boolean) {
  ensure(path)
  const next = expanded ?? !nodes[path].expanded
  setNodes(path, "expanded", next)
  if (next && nodes[path].children === null && !nodes[path].loading) loadNode(path)
}

/** Expand every ancestor of `path` so the active folder is visible in the tree. */
export function revealPath(path: string) {
  const segments = pathSegments(path)
  let current = "/"
  const chain = ["/"]
  for (const s of segments.slice(0, -1)) {
    current = current === "/" ? `/${s}` : `${current}/${s}`
    chain.push(current)
  }
  for (const p of chain) toggleNode(p, true)
}

/** Reload any already-loaded tree nodes for these folders. */
export function invalidateTree(dirs: string[]) {
  for (const d of dirs.map(normalizePath)) if (nodes[d]?.children) loadNode(d)
}

export function forgetTree(paths: string[]) {
  setNodes(
    produce((all) => {
      for (const p of paths) for (const key of Object.keys(all)) if (key === p || key.startsWith(p + "/")) delete all[key]
    }),
  )
}
