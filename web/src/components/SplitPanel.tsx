import { Accessor, Component, For, JSX, Setter, Show, createSignal, onMount } from 'solid-js'
import compactModeBus from '../signals/compactMode'
import { VsClose } from 'solid-icons/vs'
import { nanoid } from 'nanoid'
import listingSignal from '../signals/listingPanel'
import { RiDesignDragDropLine } from 'solid-icons/ri'

type PanelItem = {
  id: string
  title: string
  path: string
  element: JSX.Element
  selected: Accessor<boolean>
  setSelected: Setter<boolean>
  dropTimeout: number
  showDragBackdrop: Accessor<boolean>
  setDragBackdrop: Setter<boolean>
}

const SplitPanel: Component<{ createNew: Function }> = ({ createNew }) => {
  let spitRoot: HTMLDivElement
  const [items, setItems] = createSignal<PanelItem[]>([])
  const [roomAvailable, setRoomAvailable] = listingSignal.roomAvailable

  function addPanel() {
    if (!spitRoot || items().length >= 4) return

    const [selected, setSelected] = createSignal(false)
    const [showDragBackdrop, setDragBackdrop] = createSignal(false)

    const panel: PanelItem = {
      id: nanoid(),
      title: nanoid(),
      path: nanoid(),
      element: createNew(),
      selected,
      setSelected,
      dropTimeout: 0,
      showDragBackdrop,
      setDragBackdrop,
    }

    if (!items().find(i => i.selected() === true)) panel.setSelected(true)

    setItems([...items(), panel])
    updateLayout()
  }

  function removeSelected() {
    items().forEach(item => item.setSelected(false))
  }

  function updateLayout() {
    if (!spitRoot) return

    if (items().length === 0) {
      addPanel()
      return
    }

    setRoomAvailable(items().length < 4)

    if (items().length > 1) {
      setTimeout(() => compactModeBus.emit(true), 1)
    }
  }

  const isGrid = () => items().length > 1

  listingSignal.newPanel.listen(path => {
    addPanel()
  })

  onMount(async () => {
    updateLayout()
  })

  return (
    <div id="splitPanel">
      <div
        ref={spitRoot!}
        classList={{
          grow: true,
          'grid grid-cols-2 auto-cols-max': isGrid(),
        }}>
        <For each={items()}>
          {item => (
            <div
              classList={{
                'flex flex-col rounded relative': true,
                'h-screen pb-7': (() => items().length <= 2)(),
                'max-h-[48svh]': (() => items().length > 2)(),
                'border-2': isGrid(),
                'border-dotted border-menu': (() => !item.selected())(),
                'border-code': item.selected(),
              }}
              onmousedown={() => {
                removeSelected()
                item.setSelected(true)
              }}
              onDrop={async ev => {
                item.setDragBackdrop(false)
                ev.preventDefault()
                if (!ev.dataTransfer) return
                // if (ev.dataTransfer.items) {
                //   // Use DataTransferItemList interface to access the file(s)
                //   ;[...ev.dataTransfer.items].forEach((item, i) => {
                //     // If dropped items aren't files, reject them
                //     if (item.kind === 'file') {
                //       const file = item.getAsFile()
                //       if (!file) return
                //       console.log(`… file[${i}].name = ${file.name}`)
                //     }
                //   })
                // } else {
                //   // Use DataTransfer interface to access the file(s)
                //   ;[...ev.dataTransfer.files].forEach((file, i) => {
                //     console.log(`… file[${i}].name = ${file.name}`)
                //   })
                //}
              }}
              onDragEnter={() => {
                item.dropTimeout = new Date().getTime() + 300
                if (!item.showDragBackdrop()) item.setDragBackdrop(true)
              }}
              onDragLeave={() => {
                setTimeout(() => {
                  if (new Date().getTime() > item.dropTimeout && item.showDragBackdrop()) {
                    item.setDragBackdrop(false)
                  }
                }, 200)
              }}
              onDragOver={ev => {
                ev.preventDefault()
              }}
              onDragEnd={() => {
                item.setDragBackdrop(false)
              }}
              onpointerleave={() => {
                item.setDragBackdrop(false)
              }}>
              <Show when={isGrid()}>
                <div class="border-0 bg-900 flex text-menu">
                  <span class="grow p-2">{item.path}</span>
                  <button
                    onclick={() => {
                      setItems(items().filter(x => x.id !== item.id))
                    }}
                    type="button"
                    class="hover:bg-hover focus:ring-0 font-medium rounded-lg text-sm p-2 focus:outline-none">
                    <VsClose font-size="18" />
                  </button>
                </div>
              </Show>
              <div class="grow overflow-auto">{item.element}</div>
              <div
                classList={{
                  hidden: !item.showDragBackdrop(),
                  'absolute left-0 right-0 top-0 bottom-0 bg-900 opacity-80': true,
                }}
                onClick={() => item.setDragBackdrop(false)}>
                <div class="flex text-code text-center text-lg w-full h-full">
                  <div class="flex flex-col mx-auto my-auto">
                    <div class="mx-auto">
                      <RiDesignDragDropLine font-size="100" />
                    </div>
                    <span class="font-extrabold mt-2">Drop files here to upload</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

export default SplitPanel
