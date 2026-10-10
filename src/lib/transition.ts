/** Run a DOM-affecting update inside a View Transition when supported (smooth layout morphs). */
export function withTransition(update: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  if (!doc.startViewTransition || reduce) return update()
  doc.startViewTransition(update)
}
