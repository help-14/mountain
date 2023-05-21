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

// export function getStartUrl(): string {
//   if (parent.location.hash.length <= 2) {
//     return document.querySelector('#defaultPath').value
//   }
//   return getHashPath()
// }
