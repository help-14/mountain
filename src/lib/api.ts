import type { FileInfo } from "~/types"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, { cache: "no-store", ...init })
  } catch {
    throw new ApiError(0, "Network error: the server is unreachable")
  }
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, data?.error || response.statusText || "Request failed")
  return data as T
}

const post = <T>(url: string, body: unknown) =>
  request<T>(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })

const q = (params: Record<string, string>) => new URLSearchParams(params).toString()

export const api = {
  config: () => request<{ readOnly: boolean; rootName: string }>("/api/config"),
  list: (path: string, dirsOnly = false, signal?: AbortSignal) =>
    request<{ path: string; items: FileInfo[] }>(`/api/list?${q({ path, ...(dirsOnly ? { dirs: "1" } : {}) })}`, {
      signal,
    }),
  search: (path: string, query: string, signal?: AbortSignal) =>
    request<{ items: FileInfo[]; truncated: boolean }>(`/api/search?${q({ path, q: query })}`, { signal }),
  text: (path: string, signal?: AbortSignal) =>
    request<{ binary: boolean; text: string; truncated: boolean }>(`/api/text?${q({ path })}`, { signal }),
  createFolder: (path: string, name: string) => post<FileInfo>("/api/create", { path, name, directory: true }),
  createFile: (path: string, name: string, content = "") => post<FileInfo>("/api/create", { path, name, content }),
  rename: (path: string, name: string) => post<FileInfo>("/api/rename", { path, name }),
  remove: (paths: string[]) => post<{ deleted: number }>("/api/delete", { paths }),
  copy: (paths: string[], destination: string) => post<{ paths: string[] }>("/api/copy", { paths, destination }),
  move: (paths: string[], destination: string) => post<{ paths: string[] }>("/api/move", { paths, destination }),
  compress: (paths: string[], destination: string, name: string) =>
    post<FileInfo>("/api/compress", { paths, destination, name }),
}

export function fileUrl(path: string, inline = false) {
  return `/api/download?${q({ path, ...(inline ? { inline: "1" } : {}) })}`
}

export function downloadUrl(paths: string[]) {
  const params = new URLSearchParams()
  paths.forEach((p) => params.append("path", p))
  return `/api/download?${params}`
}

export function triggerDownload(paths: string[]) {
  const a = document.createElement("a")
  a.href = downloadUrl(paths)
  a.download = ""
  a.rel = "noopener"
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/** Upload a single file with progress; resolves with the created entry. */
export function uploadFile(
  dest: string,
  relativeName: string,
  file: Blob,
  onProgress: (loaded: number, total: number) => void,
): { promise: Promise<FileInfo>; abort: () => void } {
  const xhr = new XMLHttpRequest()
  const promise = new Promise<FileInfo>((resolve, reject) => {
    xhr.open("POST", `/api/upload?${q({ path: dest, name: relativeName })}`)
    xhr.setRequestHeader("Content-Type", "application/octet-stream")
    xhr.upload.onprogress = (e) => onProgress(e.loaded, e.lengthComputable ? e.total : file.size)
    xhr.onload = () => {
      let data: any = null
      try {
        data = JSON.parse(xhr.responseText)
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300) resolve(data)
      else reject(new ApiError(xhr.status, data?.error || xhr.statusText || "Upload failed"))
    }
    xhr.onerror = () => reject(new ApiError(0, "Network error during upload"))
    xhr.onabort = () => reject(new ApiError(-1, "Upload cancelled"))
    xhr.send(file)
  })
  return { promise, abort: () => xhr.abort() }
}
