import { createSignal } from "solid-js"
import { INTERNAL_MIME, entriesFromDataTransfer, openItem, transfer, uploadEntries } from "~/stores/actions"
import { config } from "~/stores/app"
import { activate, type Panel } from "~/stores/panels"
import type { FileInfo } from "~/types"

let lastPointer: string = "mouse"
export const lastPointerType = () => lastPointer

/** Pointer, keyboard and drag behaviour shared by tile and list items. */
export function itemHandlers(panel: Panel, item: () => FileInfo) {
  let touchTimer: ReturnType<typeof setTimeout> | undefined
  let start = { x: 0, y: 0 }

  return {
    onPointerDown(e: PointerEvent) {
      lastPointer = e.pointerType
      activate(panel.id)
      if (e.pointerType !== "mouse") {
        start = { x: e.clientX, y: e.clientY }
        // Kobalte opens the context menu after 700ms; select the item just before so actions target it.
        touchTimer = setTimeout(() => {
          if (!panel.isSelected(item().path)) panel.select(item().path)
        }, 600)
      }
    },
    onPointerMove(e: PointerEvent) {
      if (touchTimer && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) clearTimeout(touchTimer)
    },
    onPointerUp() {
      clearTimeout(touchTimer)
    },
    onPointerCancel() {
      clearTimeout(touchTimer)
    },
    onClick(e: MouseEvent) {
      e.stopPropagation()
      const path = item().path
      if (panel.state.renaming === path) return
      if (e.shiftKey) panel.select(path, "range")
      else if (e.metaKey || e.ctrlKey || panel.state.selectionMode) panel.select(path, "toggle")
      else if (lastPointer !== "mouse") openItem(panel, item())
      else panel.select(path)
    },
    onDblClick(e: MouseEvent) {
      if (lastPointer !== "mouse" || panel.state.renaming === item().path) return
      if (e.metaKey || e.ctrlKey || e.shiftKey) return
      openItem(panel, item())
    },
    onAuxClick(e: MouseEvent) {
      // middle click opens folders in a new panel
      if (e.button === 1 && item().directory) {
        e.preventDefault()
        openItem(panel, item(), { newPanel: true })
      }
    },
    onContextMenu() {
      activate(panel.id)
      if (!panel.isSelected(item().path)) panel.select(item().path)
    },
    onDragStart(e: DragEvent) {
      const path = item().path
      if (!panel.isSelected(path)) panel.select(path)
      const paths = panel.selectedPaths()
      e.dataTransfer!.effectAllowed = "copyMove"
      e.dataTransfer!.setData(INTERNAL_MIME, JSON.stringify(paths))
      e.dataTransfer!.setData("text/plain", paths.join("\n"))
      if (paths.length > 1) {
        const ghost = document.createElement("div")
        ghost.textContent = `${paths.length} items`
        ghost.style.cssText =
          "position:fixed;top:-100px;left:-100px;padding:6px 12px;border-radius:8px;background:#a7c080;color:#21272b;font:600 13px system-ui"
        document.body.appendChild(ghost)
        e.dataTransfer!.setDragImage(ghost, 10, 10)
        setTimeout(() => ghost.remove())
      }
    },
  }
}

export type DropIntent = "upload" | "move" | "copy" | null

function intentFor(e: DragEvent): DropIntent {
  const types = Array.from(e.dataTransfer?.types ?? [])
  if (types.includes(INTERNAL_MIME)) return e.altKey || e.ctrlKey || e.metaKey ? "copy" : "move"
  if (types.includes("Files")) return "upload"
  return null
}

/** Drop-target behaviour: upload OS files or move/copy internal items into `destination()`. */
export function createDropTarget(destination: () => string, opts: { exclude?: () => string | undefined } = {}) {
  const [intent, setIntent] = createSignal<DropIntent>(null)
  let depth = 0

  const reset = () => {
    depth = 0
    setIntent(null)
  }

  return {
    intent,
    handlers: {
      onDragEnter(e: DragEvent) {
        const i = intentFor(e)
        if (!i || config().readOnly) return
        e.preventDefault()
        e.stopPropagation()
        depth++
        setIntent(i)
      },
      onDragOver(e: DragEvent) {
        const i = intentFor(e)
        if (!i || config().readOnly) return
        e.preventDefault()
        e.stopPropagation()
        e.dataTransfer!.dropEffect = i === "move" ? "move" : "copy"
        if (i !== intent()) setIntent(i)
      },
      onDragLeave(e: DragEvent) {
        if (!intent()) return
        e.stopPropagation()
        depth = Math.max(0, depth - 1)
        if (depth === 0) setIntent(null)
      },
      async onDrop(e: DragEvent) {
        const i = intentFor(e)
        reset()
        if (!i || config().readOnly) return
        e.preventDefault()
        e.stopPropagation()
        const dest = destination()
        if (i === "upload") {
          uploadEntries(await entriesFromDataTransfer(e.dataTransfer!), dest)
        } else {
          let paths: string[] = []
          try {
            paths = JSON.parse(e.dataTransfer!.getData(INTERNAL_MIME))
          } catch {}
          paths = paths.filter((p) => p !== opts.exclude?.() && p !== dest)
          if (paths.length) transfer(paths, dest, i)
        }
      },
    },
    reset,
  }
}
