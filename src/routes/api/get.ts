import type { APIEvent } from "@solidjs/start/server"
import fs from "fs"
import path from "path"
import { FileInfo } from "~/types"

export function GET({ request }: APIEvent) {
  const url = new URL(request.url)
  const pathParam = url.searchParams.get("path")
  const isDirectory = url.searchParams.get("directory") === "true"

  if (!pathParam) {
    return new Response(JSON.stringify({ error: "Path parameter is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }

  const decodedPath = decodeURIComponent(Buffer.from(pathParam, 'base64').toString('utf-8'))
  const fullPath = decodedPath

  try {
    // Check if path exists
    if (!fs.existsSync(fullPath)) {
      return new Response(JSON.stringify({ error: "Path not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      })
    }

    // Get path stats
    const stats = fs.statSync(fullPath)

    // If path is a file and isDirectory is true, return error
    if (stats.isFile() && isDirectory) {
      return new Response(JSON.stringify({ error: "Path is a file" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    // If path is a file, return error
    if (stats.isFile()) {
      return new Response(JSON.stringify({ error: "Path is a file" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    // Read directory contents
    const items = fs.readdirSync(fullPath, { withFileTypes: true })

    // Filter items based on isDirectory parameter
    const filteredItems = isDirectory
      ? items.filter(item => item.isDirectory())
      : items

    // Convert to FileInfo type
    const result: FileInfo[] = filteredItems.map(item => ({
      name: item.name,
      size: item.isDirectory() ? 0 : fs.statSync(path.join(fullPath, item.name)).size,
      ext: (item.isDirectory()) ? "" : item.name?.split(".")?.pop() ?? "",
      path: path.join(decodedPath, item.name),
      directory: item.isDirectory(),
      symlink: item.isSymbolicLink(),
      modified: fs.statSync(path.join(fullPath, item.name)).mtimeMs,
      selected: false
    }))

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}