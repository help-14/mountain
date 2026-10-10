const UNITS = ["B", "KB", "MB", "GB", "TB", "PB"]

export function humanFileSize(bytes: number, dp = 1) {
  if (!Number.isFinite(bytes) || bytes < 1024) return `${Math.max(0, bytes | 0)} B`
  let u = 0
  let value = bytes
  while (value >= 1024 && u < UNITS.length - 1) {
    value /= 1024
    u++
  }
  return `${value.toFixed(value >= 100 ? 0 : dp)} ${UNITS[u]}`
}

export function formatDate(ms: number, locale?: string) {
  return new Date(ms).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })
}

/** "3 minutes ago", "yesterday", ... falls back to a full date after a week. */
export function relativeDate(ms: number, locale?: string) {
  const diff = (ms - Date.now()) / 1000
  const abs = Math.abs(diff)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
  if (abs < 60) return rtf.format(Math.round(diff), "second")
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute")
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour")
  if (abs < 7 * 86400) return rtf.format(Math.round(diff / 86400), "day")
  return new Date(ms).toLocaleDateString(locale, { dateStyle: "medium" })
}

/**
 * Replace `{0}` placeholders. `{0:item|items}` picks the singular or plural word for the number,
 * e.g. "{0} {0:item|items}" -> "1 item" / "3 items".
 */
export function formatString(template: string, ...args: (string | number)[]) {
  return template
    .replace(/\{(\d+):([^|}]*)\|([^}]*)\}/g, (_, i, one, other) => (Number(args[i]) === 1 ? one : other))
    .replace(/\{(\d+)\}/g, (m, i) => (args[i] !== undefined ? String(args[i]) : m))
}
