import { batch, createMemo, createRoot, createSignal } from "solid-js"
import { createStore, produce, reconcile } from "solid-js/store"
import { api } from "~/lib/api"
import { normalizePath, parentPath } from "~/lib/paths"
import type { FileInfo } from "~/types"
import { settings, type Settings } from "./settings"

export const MAX_PANELS = 4

type SearchState = { query: string; loading: boolean; items: FileInfo[]; truncated: boolean; error?: string }

export type PanelState = {
  path: string
  items: FileInfo[]
  status: "loading" | "ready" | "error"
  error?: string
  /** True while a request is in flight, even when old items are still shown. */
  busy: boolean
  history: string[]
  index: number
  selected: Record<string, boolean>
  anchor?: string
  focus?: string
  renaming?: string
  selectionMode: boolean
  search: SearchState | null
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" })

export function sortItems(items: FileInfo[], sort: Settings["sort"]) {
  const dir = sort.order === "asc" ? 1 : -1
  const byName = (a: FileInfo, b: FileInfo) => collator.compare(a.name, b.name)
  const cmp: Record<Settings["sort"]["by"], (a: FileInfo, b: FileInfo) => number> = {
    name: byName,
    date: (a, b) => a.modified - b.modified || byName(a, b),
    size: (a, b) => a.size - b.size || byName(a, b),
    type: (a, b) => collator.compare(a.ext, b.ext) || byName(a, b),
  }
  return [...items].sort((a, b) => {
    if (sort.foldersFirst && a.directory !== b.directory) return a.directory ? -1 : 1
    return cmp[sort.by](a, b) * dir
  })
}

export type Panel = ReturnType<typeof createPanel>

function createPanel(id: string, initialPath: string) {
  return createRoot((dispose) => {
    const [state, setState] = createStore<PanelState>({
      path: normalizePath(initialPath),
      items: [],
      status: "loading",
      busy: true,
      history: [normalizePath(initialPath)],
      index: 0,
      selected: {},
      selectionMode: false,
      search: null,
    })

    let controller: AbortController | undefined
    let searchController: AbortController | undefined

    async function load(path: string, opts: { silent?: boolean } = {}) {
      controller?.abort()
      const ctrl = (controller = new AbortController())
      setState({ busy: true, ...(opts.silent ? {} : { error: undefined }) })
      try {
        const res = await api.list(path, false, ctrl.signal)
        if (ctrl.signal.aborted) return
        batch(() => {
          const names = new Set(res.items.map((i) => i.path))
          setState("items", reconcile(res.items, { key: "path" }))
          setState({ status: "ready", busy: false, error: undefined })
          // Drop selection/focus for entries that disappeared.
          setState(
            "selected",
            produce((sel) => {
              for (const k of Object.keys(sel)) if (!names.has(k)) delete sel[k]
            }),
          )
          if (state.focus && !names.has(state.focus)) setState("focus", undefined)
        })
      } catch (err) {
        if (ctrl.signal.aborted) return
        if (opts.silent && state.status === "ready") {
          setState("busy", false)
          return
        }
        setState({ status: "error", busy: false, error: (err as Error).message, items: [] })
      }
    }

    function navigate(path: string, opts: { push?: boolean; focus?: string } = {}) {
      const target = normalizePath(path)
      const push = opts.push ?? true
      batch(() => {
        if (target !== state.path) {
          setState({ selected: {}, anchor: undefined, focus: opts.focus, renaming: undefined, search: null })
          if (state.path !== target) setState({ status: state.items.length ? state.status : "loading" })
          setState("path", target)
          if (push) {
            const history = state.history.slice(0, state.index + 1)
            history.push(target)
            if (history.length > 100) history.shift()
            setState({ history, index: history.length - 1 })
          }
        } else if (opts.focus) setState("focus", opts.focus)
      })
      return load(target)
    }

    const canBack = () => state.index > 0
    const canForward = () => state.index < state.history.length - 1

    function go(delta: number) {
      const index = state.index + delta
      if (index < 0 || index >= state.history.length) return
      const from = state.path
      setState("index", index)
      // When going back to a parent, focus the folder we came from.
      const target = state.history[index]
      navigate(target, { push: false, focus: parentPath(from) === target ? from : undefined })
    }

    const up = () => {
      if (state.path !== "/") navigate(parentPath(state.path), { focus: state.path })
    }

    const refresh = (silent = true) => load(state.path, { silent })

    /** Visible items: search results or folder content, filtered and sorted. */
    const view = createMemo(() => {
      const source = state.search ? state.search.items : state.items
      const visible = settings.view.hidden ? source : source.filter((i) => !i.hidden)
      return sortItems(visible, settings.sort)
    })

    const hiddenCount = createMemo(() => (settings.view.hidden ? 0 : state.items.filter((i) => i.hidden).length))

    const selectedItems = createMemo(() => view().filter((i) => state.selected[i.path]))
    const selectedPaths = () => selectedItems().map((i) => i.path)
    const selectionCount = () => selectedItems().length
    const isSelected = (path: string) => !!state.selected[path]

    function select(path: string, mode: "single" | "toggle" | "range" = "single") {
      batch(() => {
        if (mode === "toggle") {
          setState("selected", path, (v) => !v)
          setState("anchor", path)
        } else if (mode === "range" && state.anchor) {
          const list = view()
          const a = list.findIndex((i) => i.path === state.anchor)
          const b = list.findIndex((i) => i.path === path)
          if (a < 0 || b < 0) return select(path)
          const [from, to] = a < b ? [a, b] : [b, a]
          const next: Record<string, boolean> = {}
          for (let i = from; i <= to; i++) next[list[i].path] = true
          setState("selected", reconcile(next))
        } else {
          setState("selected", reconcile({ [path]: true }))
          setState("anchor", path)
        }
        setState("focus", path)
      })
    }

    const selectAll = () => setState("selected", reconcile(Object.fromEntries(view().map((i) => [i.path, true]))))
    const selectNone = () => setState({ selected: reconcile({}), anchor: undefined } as any)
    const invert = () =>
      setState("selected", reconcile(Object.fromEntries(view().filter((i) => !state.selected[i.path]).map((i) => [i.path, true]))))
    const setSelection = (paths: string[]) => setState("selected", reconcile(Object.fromEntries(paths.map((p) => [p, true]))))

    function moveFocus(delta: number, extend = false) {
      const list = view()
      if (!list.length) return
      const current = list.findIndex((i) => i.path === state.focus)
      const next = Math.max(0, Math.min(list.length - 1, current < 0 ? (delta > 0 ? 0 : list.length - 1) : current + delta))
      const path = list[next].path
      if (extend) {
        if (!state.anchor) setState("anchor", state.focus ?? path)
        select(path, "range")
      } else select(path)
    }

    let searchTimer: ReturnType<typeof setTimeout> | undefined
    function search(query: string) {
      clearTimeout(searchTimer)
      searchController?.abort()
      const q = query.trim()
      if (q.length < 2) {
        setState("search", q ? { query, loading: false, items: [], truncated: false } : null)
        return
      }
      setState("search", (s) => ({ query, loading: true, items: s?.items ?? [], truncated: false }))
      searchTimer = setTimeout(async () => {
        const ctrl = (searchController = new AbortController())
        try {
          const res = await api.search(state.path, q, ctrl.signal)
          if (!ctrl.signal.aborted) setState("search", { query, loading: false, items: res.items, truncated: res.truncated })
        } catch (err) {
          if (!ctrl.signal.aborted)
            setState("search", { query, loading: false, items: [], truncated: false, error: (err as Error).message })
        }
      }, 250)
    }
    const clearSearch = () => {
      clearTimeout(searchTimer)
      searchController?.abort()
      setState("search", null)
    }

    load(state.path)

    return {
      id,
      state,
      setState,
      view,
      hiddenCount,
      navigate,
      back: () => go(-1),
      forward: () => go(1),
      canBack,
      canForward,
      up,
      refresh,
      select,
      selectAll,
      selectNone,
      invert,
      setSelection,
      isSelected,
      selectedItems,
      selectedPaths,
      selectionCount,
      moveFocus,
      search,
      clearSearch,
      startRename: (path: string) => setState("renaming", path),
      stopRename: () => setState("renaming", undefined),
      setSelectionMode: (on: boolean) => setState("selectionMode", on),
      dispose: () => {
        controller?.abort()
        searchController?.abort()
        dispose()
      },
    }
  })
}

// ---------------------------------------------------------------------------
// Panel collection

const STORAGE_KEY = "mountain.panels.v1"
let counter = 0
const newId = () => `p${++counter}-${Date.now().toString(36)}`

const [panels, setPanels] = createSignal<Panel[]>([])
const [activeId, setActiveId] = createSignal<string>("")
export { panels, activeId }

export const activePanel = () => panels().find((p) => p.id === activeId()) ?? panels()[0]

function persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ paths: panels().map((p) => p.state.path), active: panels().findIndex((p) => p.id === activeId()) }),
    )
  } catch {}
}

export function initPanels() {
  if (panels().length) return
  let paths = ["/"]
  let active = 0
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")
    if (Array.isArray(saved?.paths) && saved.paths.length) {
      paths = saved.paths.slice(0, MAX_PANELS).map(String)
      active = Math.min(Math.max(0, saved.active | 0), paths.length - 1)
    }
  } catch {}
  const hash = decodeURIComponent(location.hash.slice(1))
  if (hash.startsWith("/")) paths[active] = hash
  const created = paths.map((p) => createPanel(newId(), p))
  setPanels(created)
  setActiveId(created[active].id)
}

export function addPanel(path?: string) {
  if (panels().length >= MAX_PANELS) return
  const panel = createPanel(newId(), path ?? activePanel()?.state.path ?? "/")
  setPanels([...panels(), panel])
  setActiveId(panel.id)
  persist()
  return panel
}

export function closePanel(id: string) {
  if (panels().length <= 1) return
  const list = panels()
  const idx = list.findIndex((p) => p.id === id)
  if (idx < 0) return
  list[idx].dispose()
  const next = list.filter((p) => p.id !== id)
  setPanels(next)
  if (activeId() === id) setActiveId(next[Math.max(0, idx - 1)].id)
  persist()
}

export function activate(id: string) {
  if (activeId() !== id) {
    setActiveId(id)
    persist()
  }
}

/** Keep localStorage + URL hash in sync with the active location. */
export function syncLocation() {
  persist()
  const panel = activePanel()
  if (panel) history.replaceState(null, "", `#${encodeURI(panel.state.path)}`)
}

/** Refresh every panel currently showing one of these folders. */
export function invalidatePanels(dirs: string[]) {
  const set = new Set(dirs.map(normalizePath))
  for (const p of panels()) {
    if (set.has(p.state.path)) p.refresh(true)
    else if (p.state.search) p.search(p.state.search.query)
  }
}
