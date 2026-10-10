import { createEffect, createRoot } from "solid-js"
import { createStore, reconcile } from "solid-js/store"
import type { Locale } from "~/languages"

export type SortBy = "name" | "date" | "type" | "size"
export type ViewMode = "tile" | "list"

export type Settings = {
  sort: { by: SortBy; order: "asc" | "desc"; foldersFirst: boolean }
  view: {
    as: ViewMode
    navigation: boolean
    preview: boolean
    extension: boolean
    hidden: boolean
    thumbnails: boolean
  }
  prefs: { confirmDelete: boolean; relativeDates: boolean; language: Locale }
}

const KEY = "mountain.settings.v2"

const defaults = (): Settings => ({
  sort: { by: "name", order: "asc", foldersFirst: true },
  view: { as: "tile", navigation: true, preview: false, extension: true, hidden: false, thumbnails: true },
  prefs: { confirmDelete: true, relativeDates: false, language: detectLanguage() },
})

function detectLanguage(): Locale {
  if (typeof navigator === "undefined") return "en"
  const lang = navigator.language?.slice(0, 2)
  return lang === "vi" || lang === "ru" ? lang : "en"
}

const [settings, setSettings] = createStore<Settings>(defaults())
export { settings, setSettings }

let initialized = false

/** Load persisted settings (client only) and keep them in sync with localStorage. */
export function initSettings() {
  if (initialized || typeof window === "undefined") return
  initialized = true
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Partial<Settings>
      const base = defaults()
      setSettings(
        reconcile({
          sort: { ...base.sort, ...saved.sort },
          view: { ...base.view, ...saved.view },
          prefs: { ...base.prefs, ...saved.prefs },
        }),
      )
    }
  } catch {
    // corrupted or unavailable storage: keep defaults
  }
  createRoot(() =>
    createEffect(() => {
      const json = JSON.stringify(settings)
      try {
        localStorage.setItem(KEY, json)
      } catch {}
    }),
  )
  if (typeof window !== "undefined") document.documentElement.lang = settings.prefs.language
}
