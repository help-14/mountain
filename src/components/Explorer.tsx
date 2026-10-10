import { Show, createEffect, on, onCleanup, onMount } from "solid-js"
import Dialogs from "~/components/Dialogs"
import Nav from "~/components/Nav"
import SplitPanel from "~/components/SplitPanel"
import Toaster from "~/components/Toaster"
import PreviewPanel from "~/components/explorer/PreviewPanel"
import Sidebar from "~/components/explorer/Sidebar"
import { withTransition } from "~/lib/transition"
import {
  copyToClipboard,
  createFile,
  createFolder,
  deleteSelection,
  openSelection,
  paste,
  pickAndUpload,
  renameSelection,
} from "~/stores/actions"
import { drawerOpen, loadConfig, setDrawerOpen } from "~/stores/app"
import { dialog, openInfoDialog } from "~/stores/dialogs"
import { activePanel, addPanel, closePanel, initPanels, panels, syncLocation } from "~/stores/panels"
import { initSettings, settings } from "~/stores/settings"
import { isMac } from "./explorer/keys"

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))
}

function columnsOf(panelId: string) {
  // Tile grids wrap: measure how many tiles fit per row for up/down arrow navigation.
  const el = document.querySelector(`[data-panel="${panelId}"] [role="option"]`) as HTMLElement | null
  if (!el?.parentElement) return 1
  const style = getComputedStyle(el.parentElement)
  return Math.max(1, style.gridTemplateColumns.split(" ").length)
}

function onKeyDown(e: KeyboardEvent) {
  if (dialog() || isTyping(e.target)) return
  // Let open menus handle their own keyboard navigation.
  if (document.querySelector("[data-kb-menu-content][data-expanded], .menu-surface[data-expanded]")) return
  const panel = activePanel()
  if (!panel) return
  const mod = isMac ? e.metaKey : e.ctrlKey
  const key = e.key
  const code = e.code
  const run = (fn: () => void) => {
    e.preventDefault()
    fn()
  }

  if (mod && !e.altKey) {
    switch (key.toLowerCase()) {
      case "a":
        return run(() => panel.selectAll())
      case "i":
        return run(() => panel.invert())
      case "c":
        if (window.getSelection()?.toString()) return
        return run(() => copyToClipboard("copy", panel))
      case "x":
        return run(() => copyToClipboard("cut", panel))
      case "v":
        return run(() => paste(panel))
      case "f":
        return run(() => focusSearch(panel.id))
      case "backspace":
        return run(() => deleteSelection(panel))
      case "arrowup":
        return run(() => panel.up())
      case "arrowdown":
        return run(() => openSelection(panel))
    }
    return
  }

  if (e.altKey && !mod) {
    switch (code) {
      case "ArrowLeft":
        return run(() => panel.back())
      case "ArrowRight":
        return run(() => panel.forward())
      case "ArrowUp":
        return run(() => panel.up())
      case "KeyN":
        return run(() => (e.shiftKey ? createFile(panel) : createFolder(panel)))
      case "KeyU":
        return run(() => pickAndUpload(false, panel))
      case "KeyR":
        return run(() => panel.refresh(false))
      case "KeyT":
        return run(() => withTransition(() => addPanel()))
      case "KeyW":
        return run(() => withTransition(() => closePanel(panel.id)))
    }
    if (/^Digit[1-4]$/.test(code)) {
      const target = panels()[Number(code.slice(5)) - 1]
      if (target) return run(() => document.querySelector<HTMLElement>(`[data-panel="${target.id}"] [role="listbox"]`)?.focus())
    }
    return
  }

  const tiles = settings.view.as === "tile"
  switch (key) {
    case "Escape":
      if (panel.state.search) return run(() => panel.clearSearch())
      return run(() => {
        panel.selectNone()
        panel.setSelectionMode(false)
      })
    case "Enter":
      return run(() => openSelection(panel))
    case "Backspace":
      return run(() => panel.up())
    case "Delete":
      return run(() => deleteSelection(panel))
    case "F2":
      return run(() => renameSelection(panel))
    case "/":
      return run(() => focusSearch(panel.id))
    case "?":
      return run(() => openInfoDialog("shortcuts"))
    case "ArrowDown":
      return run(() => panel.moveFocus(tiles ? columnsOf(panel.id) : 1, e.shiftKey))
    case "ArrowUp":
      return run(() => panel.moveFocus(tiles ? -columnsOf(panel.id) : -1, e.shiftKey))
    case "ArrowRight":
      if (tiles) return run(() => panel.moveFocus(1, e.shiftKey))
      return
    case "ArrowLeft":
      if (tiles) return run(() => panel.moveFocus(-1, e.shiftKey))
      return
    case "Home":
      return run(() => panel.moveFocus(-1e9, e.shiftKey))
    case "End":
      return run(() => panel.moveFocus(1e9, e.shiftKey))
    case " ":
      if (panel.state.focus) return run(() => panel.select(panel.state.focus!, "toggle"))
      return
  }
}

function focusSearch(panelId: string) {
  const input = document.querySelector<HTMLInputElement>(`[data-search-input="${panelId}"]`)
  input?.focus()
}

export default function Explorer() {
  initSettings()
  initPanels()

  onMount(() => {
    loadConfig()
    window.addEventListener("keydown", onKeyDown)
    // Pick up changes made outside the app when the tab regains focus.
    let lastRefresh = Date.now()
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastRefresh > 5000) {
        lastRefresh = Date.now()
        panels().forEach((p) => p.refresh(true))
      }
    }
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("focus", onVisible)
    const onHash = () => {
      const path = decodeURIComponent(location.hash.slice(1))
      const panel = activePanel()
      if (panel && path.startsWith("/") && path !== panel.state.path) panel.navigate(path)
    }
    window.addEventListener("hashchange", onHash)
    onCleanup(() => {
      window.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("focus", onVisible)
      window.removeEventListener("hashchange", onHash)
    })
  })

  // Persist panel locations + mirror the active folder in the URL.
  createEffect(on(() => [activePanel()?.id, ...panels().map((p) => p.state.path)], () => syncLocation(), { defer: false }))
  createEffect(() => (document.documentElement.lang = settings.prefs.language))
  createEffect(() => {
    const p = activePanel()
    const name = p?.state.path === "/" ? "" : p?.state.path.split("/").pop()
    document.title = name ? `${name} — Mountain` : "Mountain"
  })

  return (
    <div class="flex h-dvh flex-col overflow-hidden bg-900">
      <Nav />
      <div class="flex min-h-0 flex-1">
        <Show when={settings.view.navigation}>
          <div class="hidden w-64 shrink-0 border-r border-line/60 lg:block" style={{ "view-transition-name": "sidebar" }}>
            <Sidebar />
          </div>
        </Show>

        <main class="min-w-0 flex-1 bg-950/40 p-2">
          <SplitPanel />
        </main>

        <Show when={settings.view.preview}>
          <div class="hidden w-80 shrink-0 border-l border-line/60 xl:block" style={{ "view-transition-name": "preview" }}>
            <PreviewPanel />
          </div>
        </Show>
      </div>

      {/* mobile navigation drawer */}
      <Show when={drawerOpen()}>
        <div class="fixed inset-0 z-40 lg:hidden">
          <div class="absolute inset-0 animate-fade-in bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div class="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-drawer-in border-r border-line bg-900 shadow-2xl">
            <Sidebar mobile />
          </div>
        </div>
      </Show>

      <Dialogs />
      <Toaster />
    </div>
  )
}
