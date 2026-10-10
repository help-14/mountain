import { createSignal } from "solid-js"

export type PromptOptions = {
  title: string
  label: string
  initial?: string
  placeholder?: string
  submit: string
  /** Select only the part before the extension when the dialog opens. */
  selectBaseName?: boolean
  validate?: (value: string) => string | undefined
  multiline?: { label: string; placeholder?: string }
}

export type DialogSpec =
  | { type: "prompt"; options: PromptOptions; resolve: (v: { value: string; content?: string } | null) => void }
  | {
      type: "confirm"
      options: { title: string; description: string; submit: string; danger?: boolean }
      resolve: (v: boolean) => void
    }
  | {
      type: "destination"
      options: { title: string; start: string; mode: "copy" | "move" }
      resolve: (v: string | null) => void
    }
  | { type: "shortcuts" }
  | { type: "about" }
  | { type: "preferences" }

const [dialog, setDialog] = createSignal<DialogSpec | null>(null)
export { dialog }

/** Close the current dialog; when `spec` is given, only if it is still the one shown. */
export function closeDialog(spec?: DialogSpec | null) {
  if (spec && dialog() !== spec) return
  setDialog(null)
}

export function promptDialog(options: PromptOptions) {
  return new Promise<{ value: string; content?: string } | null>((resolve) =>
    setDialog({ type: "prompt", options, resolve }),
  )
}

export function confirmDialog(options: { title: string; description: string; submit: string; danger?: boolean }) {
  return new Promise<boolean>((resolve) => setDialog({ type: "confirm", options, resolve }))
}

export function pickDestination(options: { title: string; start: string; mode: "copy" | "move" }) {
  return new Promise<string | null>((resolve) => setDialog({ type: "destination", options, resolve }))
}

export function openInfoDialog(type: "shortcuts" | "about" | "preferences") {
  setDialog({ type })
}
