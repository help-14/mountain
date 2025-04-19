import { FileInfo, SortSettings } from '~/types'

export function utf8_to_b64(str: string): string {
  return window.btoa(encodeURIComponent(str))
}

export function b64_to_utf8(str: string): string {
  return decodeURIComponent(window.atob(str))
}

export function getHashPath(): string {
  return decodeURI(parent.location.hash.substring(1))
}

export function isTouchDevice(): boolean {
  return navigator.maxTouchPoints > 0 || 'ontouchstart' in document.documentElement
}

export function isSmallScreen(): boolean {
  var vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
  return vw < 768
}

export function combinePath(...paths: string[]): string {
  return paths.map(i => i.replace(/(^\/|\/$)/, '')).join('/')
}

export function enabled(element: string, state: boolean): void {
  const e = document.querySelector(element)
  if (e) {
    if (state) e.removeAttribute('disabled')
    else e.setAttribute('disabled', 'true')
  }
}

export function sortData(arr: FileInfo[], { by, order, group }: SortSettings) {
  if (!arr) return []

  let o = order === 0 ? 1 : -1
  let result = arr

  if (result.length > 0) {
    if (by === 'name') {
      result = arr.sort((a, b) => {
        let x = a.name.toLowerCase()
        let y = b.name.toLowerCase()
        if (x < y) {
          return -1 * o
        }
        if (x > y) {
          return 1 * o
        }
        return 0
      })
    } else if (by === 'date') {
      result = arr.sort((a, b) => {
        let x = new Date(a.modified)
        let y = new Date(b.modified)
        if (x < y) {
          return -1 * o
        }
        if (x > y) {
          return 1 * o
        }
        return 0
      })
    } else if (by === 'type') {
      result = arr.sort((a, b) => {
        let x = a.ext.toLowerCase()
        let y = b.ext.toLowerCase()
        if (x < y) {
          return -1 * o
        }
        if (x > y) {
          return 1 * o
        }
        return 0
      })
    }

    if (group) {
      let dirs = []
      let files = []
      for (let i = 0; i < result.length; i++) {
        const test = result[i]
        if (test.directory) {
          dirs.push({ ...test })
        } else {
          files.push({ ...test })
        }
      }
      result = o === 1 ? dirs.concat(files) : files.concat(dirs)
    }
  }

  return result
}
