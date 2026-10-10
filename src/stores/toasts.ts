import { createStore, produce } from "solid-js/store"

export type ToastKind = "success" | "error" | "info"
export type Toast = {
  id: number
  kind: ToastKind
  title: string
  message?: string
  action?: { label: string; run: () => void }
  leaving?: boolean
}

const [toasts, setToasts] = createStore<Toast[]>([])
export { toasts }

let nextId = 1
const timers = new Map<number, ReturnType<typeof setTimeout>>()

export function dismissToast(id: number) {
  clearTimeout(timers.get(id))
  timers.delete(id)
  const idx = toasts.findIndex((t) => t.id === id)
  if (idx < 0 || toasts[idx].leaving) return
  setToasts(idx, "leaving", true)
  setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 220)
}

function schedule(id: number, ms: number) {
  clearTimeout(timers.get(id))
  timers.set(id, setTimeout(() => dismissToast(id), ms))
}

export function pauseToast(id: number) {
  clearTimeout(timers.get(id))
}

export function resumeToast(id: number) {
  const toast = toasts.find((t) => t.id === id)
  if (toast) schedule(id, toast.kind === "error" ? 5000 : 2500)
}

export function toast(kind: ToastKind, title: string, message?: string, action?: Toast["action"]) {
  const id = nextId++
  setToasts(
    produce((list) => {
      list.push({ id, kind, title, message, action })
      // keep the stack short
      while (list.filter((t) => !t.leaving).length > 4) {
        const oldest = list.find((t) => !t.leaving)
        if (!oldest) break
        oldest.leaving = true
        setTimeout(() => setToasts((l) => l.filter((t) => t.id !== oldest.id)), 220)
      }
    }),
  )
  schedule(id, kind === "error" ? 7000 : 3500)
  return id
}

export const notify = {
  success: (title: string, message?: string, action?: Toast["action"]) => toast("success", title, message, action),
  error: (title: string, message?: string) => toast("error", title, message),
  info: (title: string, message?: string) => toast("info", title, message),
}
