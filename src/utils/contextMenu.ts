import { createEventBus } from '@solid-primitives/event-bus'

const hideContextMenu = createEventBus()

document.addEventListener('click', () => {
  hideContextMenu.emit()
})

export function setupContextMenu(zone: HTMLElement, menu: HTMLElement) {
  if (!zone || !menu) return

  menu.style.display = 'none'
  menu.style.position = 'absolute'

  zone.addEventListener('contextmenu', e => {
    hideContextMenu.emit()

    const event = e as MouseEvent
    event.preventDefault()
    menu.style.display = 'block'

    const offset = {
      left: -10,
      top: -10,
    }

    let reference: HTMLElement = menu.offsetParent as HTMLElement

    while (reference) {
      offset.left += reference.offsetLeft
      offset.top += reference.offsetTop
      reference = reference.offsetParent as HTMLElement
    }

    menu.style.left = `${event.clientX - offset.left}px`
    menu.style.top = `${event.clientY - offset.top}px`
  })

  hideContextMenu.listen(() => {
    menu.style.display = 'none'
  })
}
