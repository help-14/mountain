export type PreviewKind = "image" | "video" | "audio" | "pdf" | "text" | "none"

const IMAGE = new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "bmp", "ico", "svg"])
const VIDEO = new Set(["mp4", "webm", "m4v", "mov", "ogv"])
const AUDIO = new Set(["mp3", "wav", "ogg", "oga", "m4a", "flac", "aac"])
const TEXT = new Set([
  "txt", "md", "markdown", "log", "csv", "tsv", "json", "jsonc", "yaml", "yml", "toml", "ini", "conf", "cfg", "env",
  "xml", "html", "htm", "css", "scss", "less", "js", "mjs", "cjs", "jsx", "ts", "tsx", "vue", "svelte", "py", "rb",
  "go", "rs", "java", "kt", "c", "h", "cpp", "hpp", "cs", "php", "sh", "bash", "zsh", "fish", "ps1", "bat", "sql",
  "lua", "swift", "dart", "r", "pl", "gradle", "properties", "gitignore", "dockerfile", "makefile", "lock",
])

export function previewKind(ext: string, directory = false): PreviewKind {
  if (directory) return "none"
  const e = ext.toLowerCase()
  if (IMAGE.has(e)) return "image"
  if (VIDEO.has(e)) return "video"
  if (AUDIO.has(e)) return "audio"
  if (e === "pdf") return "pdf"
  if (TEXT.has(e)) return "text"
  return "none"
}

export const THUMBNAIL_MAX_BYTES = 12 * 1024 * 1024
