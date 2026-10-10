import { createStore, produce } from "solid-js/store"

export type TaskKind = "upload" | "copy" | "move" | "delete" | "compress" | "rename"
export type Task = {
  id: number
  kind: TaskKind
  label: string
  detail?: string
  /** 0..1, or null for indeterminate progress */
  progress: number | null
  status: "running" | "done" | "error" | "cancelled"
  error?: string
  cancel?: () => void
}

const [tasks, setTasks] = createStore<Task[]>([])
export { tasks }

let nextId = 1

export function startTask(kind: TaskKind, label: string, init: Partial<Task> = {}) {
  const id = nextId++
  setTasks((list) => [...list, { id, kind, label, progress: null, status: "running", ...init }])
  const update = (patch: Partial<Task>) =>
    setTasks(
      (t) => t.id === id,
      produce((t) => Object.assign(t, patch)),
    )
  const finish = (status: Task["status"], error?: string) => {
    update({ status, error, progress: status === "done" ? 1 : null, cancel: undefined })
    setTimeout(() => setTasks((list) => list.filter((t) => t.id !== id)), status === "error" ? 6000 : 1800)
  }
  return { id, update, finish }
}

/** Run an async operation as a tracked (indeterminate) task. */
export async function runTask<T>(kind: TaskKind, label: string, fn: () => Promise<T>): Promise<T> {
  // Short operations shouldn't flash a task row: only show it if it takes a while.
  let handle: ReturnType<typeof startTask> | undefined
  const timer = setTimeout(() => (handle = startTask(kind, label)), 350)
  try {
    const result = await fn()
    clearTimeout(timer)
    handle?.finish("done")
    return result
  } catch (err) {
    clearTimeout(timer)
    handle?.finish("error", (err as Error).message)
    throw err
  }
}

export const activeTasks = () => tasks.filter((t) => t.status === "running")
