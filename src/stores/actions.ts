import { batch } from "solid-js"
import { api, fileUrl, triggerDownload, uploadFile } from "~/lib/api"
import { previewKind } from "~/lib/fileTypes"
import { humanFileSize } from "~/lib/format"
import { t } from "~/lib/i18n"
import { baseName, isWithin, parentPath, splitExtension } from "~/lib/paths"
import type { FileInfo } from "~/types"
import { clipboard, config, setClipboard } from "./app"
import { confirmDialog, pickDestination, promptDialog } from "./dialogs"
import { activePanel, addPanel, invalidatePanels, panels, type Panel } from "./panels"
import { settings } from "./settings"
import { runTask, startTask } from "./tasks"
import { notify } from "./toasts"
import { forgetTree, invalidateTree } from "./tree"

const fail = (err: unknown) => notify.error(t("toast.title"), (err as Error)?.message)

function refreshDirs(dirs: string[]) {
  const unique = [...new Set(dirs)]
  invalidatePanels(unique)
  invalidateTree(unique)
}

function guardWrite() {
  if (config().readOnly) {
    notify.info(t("toast.readOnly"))
    return false
  }
  return true
}

function validateName(value: string, emptyKey: "toast.error.fileNameEmpty" | "toast.error.folderNameEmpty") {
  const v = value.trim()
  if (!v) return t(emptyKey)
  if (/[\/\\]/.test(v) || v === "." || v === "..") return t("toast.error.invalidName")
}

// ---------------------------------------------------------------------------
// Opening

export function openItem(panel: Panel, item: FileInfo, opts: { newPanel?: boolean } = {}) {
  if (item.directory) {
    if (opts.newPanel) addPanel(item.path)
    else panel.navigate(item.path)
    return
  }
  if (panel.state.search) {
    // Opening a search hit reveals it in its folder.
    panel.navigate(parentPath(item.path), { focus: item.path }).then(() => panel.select(item.path))
    return
  }
  if (previewKind(item.ext) !== "none") window.open(fileUrl(item.path, true), "_blank", "noopener")
  else triggerDownload([item.path])
}

export function openSelection(panel = activePanel()) {
  if (!panel) return
  const items = panel.selectedItems()
  const focus = panel.view().find((i) => i.path === panel.state.focus)
  const target = items.length === 1 ? items[0] : (focus ?? items[0])
  if (target) openItem(panel, target)
}

// ---------------------------------------------------------------------------
// Create / rename / delete

export async function createFolder(panel = activePanel()) {
  if (!panel || !guardWrite()) return
  const result = await promptDialog({
    title: t("modals.newFolder.title"),
    label: t("modals.newFolder.name"),
    placeholder: t("modals.newFolder.namePlaceholder"),
    initial: t("modals.newFolder.namePlaceholder"),
    submit: t("modals.newFolder.submit"),
    validate: (v) => validateName(v, "toast.error.folderNameEmpty"),
  })
  if (!result) return
  try {
    const dir = panel.state.path
    const created = await api.createFolder(dir, result.value.trim())
    refreshDirs([dir])
    await panel.refresh()
    panel.select(created.path)
    notify.success(t("toast.created", created.name))
  } catch (err) {
    fail(err)
  }
}

export async function createFile(panel = activePanel()) {
  if (!panel || !guardWrite()) return
  const result = await promptDialog({
    title: t("modals.newFile.title"),
    label: t("modals.newFile.name"),
    placeholder: t("modals.newFile.namePlaceholder"),
    initial: "untitled.txt",
    selectBaseName: true,
    submit: t("modals.newFile.submit"),
    validate: (v) => validateName(v, "toast.error.fileNameEmpty"),
    multiline: { label: t("modals.newFile.content"), placeholder: t("modals.newFile.contentPlaceholder") },
  })
  if (!result) return
  try {
    const dir = panel.state.path
    const created = await api.createFile(dir, result.value.trim(), result.content ?? "")
    refreshDirs([dir])
    await panel.refresh()
    panel.select(created.path)
    notify.success(t("toast.created", created.name))
  } catch (err) {
    fail(err)
  }
}

/** Inline rename (list/tile) commits through here. Returns false to keep editing. */
export async function commitRename(panel: Panel, item: FileInfo, name: string): Promise<boolean> {
  const trimmed = name.trim()
  if (trimmed === item.name || !trimmed) {
    panel.stopRename()
    return true
  }
  const invalid = validateName(trimmed, item.directory ? "toast.error.folderNameEmpty" : "toast.error.fileNameEmpty")
  if (invalid) {
    notify.error(invalid)
    return false
  }
  try {
    const renamed = await runTask("rename", item.name, () => api.rename(item.path, trimmed))
    panel.stopRename()
    const dir = parentPath(item.path)
    if (item.directory) forgetTree([item.path])
    refreshDirs([dir])
    await panel.refresh()
    panel.select(renamed.path)
    notify.success(t("toast.renamed", renamed.name))
    return true
  } catch (err) {
    fail(err)
    return false
  }
}

export function renameSelection(panel = activePanel()) {
  if (!panel || !guardWrite()) return
  const items = panel.selectedItems()
  const target = items.length ? items[0] : panel.view().find((i) => i.path === panel.state.focus)
  if (!target) return
  panel.select(target.path)
  panel.startRename(target.path)
}

export async function deleteSelection(panel = activePanel(), items?: FileInfo[]) {
  if (!panel || !guardWrite()) return
  const targets = items ?? panel.selectedItems()
  if (!targets.length) return
  if (settings.prefs.confirmDelete) {
    const ok = await confirmDialog({
      title: targets.length === 1 ? t("modals.delete.titleOne", targets[0].name) : t("modals.delete.title", targets.length),
      description: t("modals.delete.description"),
      submit: t("modals.delete.submit"),
      danger: true,
    })
    if (!ok) return
  }
  const paths = targets.map((i) => i.path)
  // Optimistically hide the items for a snappy feel.
  panel.setState("items", (list) => list.filter((i) => !paths.includes(i.path)))
  panel.selectNone()
  try {
    await runTask("delete", targets.length === 1 ? targets[0].name : t("files.items", targets.length), () =>
      api.remove(paths),
    )
    forgetTree(paths.filter((_, i) => targets[i].directory))
    notify.success(t("toast.deleted", targets.length))
  } catch (err) {
    fail(err)
  } finally {
    refreshDirs(paths.map(parentPath))
  }
}

// ---------------------------------------------------------------------------
// Clipboard, copy & move

export function copyToClipboard(mode: "copy" | "cut", panel = activePanel()) {
  if (!panel) return
  const paths = panel.selectedPaths()
  if (!paths.length) return
  if (mode === "cut" && !guardWrite()) return
  setClipboard({ mode, paths })
  notify.info(mode === "copy" ? t("toast.clipboardCopy", paths.length) : t("toast.clipboardCut", paths.length))
}

export async function transfer(paths: string[], destination: string, mode: "copy" | "move") {
  if (!paths.length || !guardWrite()) return
  // Moving an item into its current folder is a no-op.
  const effective = mode === "move" ? paths.filter((p) => parentPath(p) !== destination) : paths
  if (!effective.length) return
  if (effective.some((p) => isWithin(p, destination))) {
    notify.error(t("toast.title"), `"${baseName(effective.find((p) => isWithin(p, destination))!)}" → ${destination}`)
    return
  }
  const label = effective.length === 1 ? baseName(effective[0]) : t("files.items", effective.length)
  try {
    const res = await runTask(mode, label, () =>
      mode === "copy" ? api.copy(effective, destination) : api.move(effective, destination),
    )
    if (mode === "move") forgetTree(effective)
    refreshDirs([destination, ...effective.map(parentPath)])
    notify.success(mode === "copy" ? t("toast.copied", effective.length) : t("toast.moved", effective.length))
    // If the destination is open in the active panel, highlight the new items.
    const panel = activePanel()
    if (panel?.state.path === destination) {
      await panel.refresh()
      panel.setSelection(res.paths)
    }
    return res.paths
  } catch (err) {
    fail(err)
  }
}

export async function paste(panel = activePanel()) {
  const clip = clipboard()
  if (!panel || !clip || !guardWrite()) return
  const destination = panel.state.path
  const done = await transfer(clip.paths, destination, clip.mode === "cut" ? "move" : "copy")
  if (done && clip.mode === "cut") setClipboard(null)
}

export async function transferTo(mode: "copy" | "move", panel = activePanel()) {
  if (!panel || !guardWrite()) return
  const paths = panel.selectedPaths()
  if (!paths.length) return
  const other = panels().find((p) => p.id !== panel.id)
  const destination = await pickDestination({
    title: mode === "copy" ? t("controls.copyTo") : t("controls.moveTo"),
    start: other?.state.path ?? panel.state.path,
    mode,
  })
  if (destination) await transfer(paths, destination, mode)
}

// ---------------------------------------------------------------------------
// Compress / download / misc

export async function compressSelection(panel = activePanel()) {
  if (!panel || !guardWrite()) return
  const items = panel.selectedItems()
  if (!items.length) return
  const suggested = items.length === 1 ? splitExtension(items[0].name)[0] : baseName(panel.state.path) || config().rootName
  const result = await promptDialog({
    title: t("modals.compress.title", items.length),
    label: t("modals.compress.fileName"),
    initial: `${suggested}.zip`,
    selectBaseName: true,
    submit: t("modals.compress.submit"),
    validate: (v) => validateName(v, "toast.error.fileNameEmpty"),
  })
  if (!result) return
  const dir = panel.state.path
  try {
    const created = await runTask("compress", result.value, () =>
      api.compress(
        items.map((i) => i.path),
        dir,
        result.value.trim(),
      ),
    )
    refreshDirs([dir])
    await panel.refresh()
    panel.select(created.path)
    notify.success(t("toast.compressed", created.name), humanFileSize(created.size))
  } catch (err) {
    fail(err)
  }
}

export function downloadSelection(panel = activePanel(), items?: FileInfo[]) {
  if (!panel) return
  const targets = items ?? panel.selectedItems()
  if (targets.length) triggerDownload(targets.map((i) => i.path))
}

export async function copyPath(path: string) {
  try {
    await navigator.clipboard.writeText(path)
    notify.info(t("toast.pathCopied"), path)
  } catch (err) {
    fail(err)
  }
}

// ---------------------------------------------------------------------------
// Upload

type UploadEntry = { file: File; name: string }

export function uploadEntries(entries: UploadEntry[], destination: string) {
  if (!entries.length || !guardWrite()) return
  const total = entries.reduce((s, e) => s + e.file.size, 0) || 1
  const loaded = new Array(entries.length).fill(0)
  let cancelled = false
  let current: { abort: () => void } | undefined
  const task = startTask("upload", t("upload.uploading", entries.length), {
    progress: 0,
    detail: humanFileSize(total),
    cancel: () => {
      cancelled = true
      current?.abort()
    },
  })

  ;(async () => {
    let failed = 0
    let lastRefresh = 0
    const CONCURRENCY = 3
    let cursor = 0
    const worker = async () => {
      while (!cancelled && cursor < entries.length) {
        const i = cursor++
        const { file, name } = entries[i]
        const up = uploadFile(destination, name, file, (l) => {
          loaded[i] = l
          const sum = loaded.reduce((a, b) => a + b, 0)
          task.update({ progress: Math.min(1, sum / total), detail: `${humanFileSize(sum)} / ${humanFileSize(total)}` })
        })
        current = up
        try {
          await up.promise
          loaded[i] = file.size
          // Refresh periodically so files appear while a large batch is still running.
          if (Date.now() - lastRefresh > 1500) {
            lastRefresh = Date.now()
            refreshDirs([destination])
          }
        } catch {
          if (!cancelled) failed++
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, entries.length) }, worker))
    batch(() => refreshDirs([destination]))
    if (cancelled) {
      task.finish("cancelled")
      notify.info(t("upload.cancelled"))
    } else if (failed) {
      task.finish("error", t("upload.failed", failed))
      notify.error(t("toast.error.upload"), t("upload.failed", failed))
    } else {
      task.finish("done")
      notify.success(t("upload.completed"), t("upload.completedMessage", entries.length))
    }
  })()
}

export function pickAndUpload(folder = false, panel = activePanel()) {
  if (!panel || !guardWrite()) return
  const input = document.createElement("input")
  input.type = "file"
  input.multiple = true
  if (folder) input.webkitdirectory = true
  input.onchange = () => {
    const files = Array.from(input.files ?? [])
    uploadEntries(
      files.map((file) => ({ file, name: (file as any).webkitRelativePath || file.name })),
      panel.state.path,
    )
  }
  input.click()
}

/** Collect files from a drop event, walking dropped folders recursively. */
export async function entriesFromDataTransfer(dt: DataTransfer): Promise<UploadEntry[]> {
  const items = Array.from(dt.items ?? []).filter((i) => i.kind === "file")
  const roots = items.map((i) => (i as any).webkitGetAsEntry?.() as FileSystemEntry | null)
  if (!roots.length || roots.some((r) => !r)) {
    return Array.from(dt.files).map((file) => ({ file, name: file.name }))
  }
  const out: UploadEntry[] = []
  const walk = async (entry: FileSystemEntry, prefix: string): Promise<void> => {
    if (entry.isFile) {
      const file = await new Promise<File>((res, rej) => (entry as FileSystemFileEntry).file(res, rej))
      out.push({ file, name: prefix + entry.name })
    } else if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader()
      let batchEntries: FileSystemEntry[]
      do {
        batchEntries = await new Promise((res, rej) => reader.readEntries(res, rej))
        for (const child of batchEntries) await walk(child, `${prefix}${entry.name}/`)
      } while (batchEntries.length)
    }
  }
  for (const root of roots) await walk(root!, "")
  return out
}

export const INTERNAL_MIME = "application/x-mountain-paths"
