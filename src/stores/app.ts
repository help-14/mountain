import { createSignal } from "solid-js"
import { api } from "~/lib/api"

const [config, setConfig] = createSignal({ readOnly: false, rootName: "/" })
export { config }

export async function loadConfig() {
  try {
    setConfig(await api.config())
  } catch {}
}

export type Clipboard = { mode: "copy" | "cut"; paths: string[] } | null
const [clipboard, setClipboard] = createSignal<Clipboard>(null)
export { clipboard, setClipboard }

/** Mobile layout: the sidebar becomes an overlay drawer. */
const [drawerOpen, setDrawerOpen] = createSignal(false)
export { drawerOpen, setDrawerOpen }
