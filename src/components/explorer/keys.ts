export const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)
export const MOD = isMac ? "⌘" : "Ctrl"
export const ALT = isMac ? "⌥" : "Alt"
export const SHIFT = isMac ? "⇧" : "Shift"
export const combo = (...keys: string[]) => (isMac ? keys.join("") : keys.join("+"))
