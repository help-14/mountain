export type FileInfo = {
  name: string
  size: number
  ext: string
  /** Virtual path, rooted at "/" (the served directory). */
  path: string
  directory: boolean
  symlink: boolean
  modified: number
  hidden: boolean
}
