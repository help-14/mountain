import { Accessor, Component, For, JSX, Setter, Show, createSignal, onMount } from 'solid-js'
import compactModeBus from '../signals/compactMode'
import addPanelBus from '../signals/addListingPanel'
import { VsClose } from 'solid-icons/vs'
import { nanoid } from 'nanoid'

type PanelItem = {
  id: string
  title: string
  path: string
  element: JSX.Element
  selected: Accessor<boolean>
  setSelected: Setter<boolean>
}

const SplitPanel: Component<{ createNew: Function }> = ({ createNew }) => {
  let spitRoot: HTMLDivElement
  const [items, setItems] = createSignal<PanelItem[]>([])

  function addPanel() {
    if (!spitRoot || items().length >= 4) return

    const [selected, setSelected] = createSignal(false)
    const panel: PanelItem = {
      id: nanoid(),
      title: 'asdadasdad',
      path: 'adsadsasda',
      element: createNew(),
      selected,
      setSelected,
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

    if (items().length > 1) {
      setTimeout(() => compactModeBus.emit(true), 10)
    }
  }

  const isGrid = () => items().length > 1

  addPanelBus.listen(() => addPanel())

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
              onmousedown={() => {
                removeSelected()
                item.setSelected(true)
              }}
              classList={{
                'flex flex-col rounded': true,
                'h-screen pb-7': (() => items().length <= 2)(),
                'max-h-[48svh]': (() => items().length > 2)(),
                'border-2': isGrid(),
                'border-dotted border-menu': (() => !item.selected())(),
                'border-code': item.selected(),
              }}>
              <Show when={isGrid()}>
                <div class="border-0 bg-900 flex text-menu">
                  <span class="grow p-2">{item.path}</span>
                  <button
                    type="button"
                    class="hover:bg-hover focus:ring-0 font-medium rounded-lg text-sm p-2 focus:outline-none">
                    <VsClose font-size="18" />
                  </button>
                </div>
              </Show>
              <div class="grow overflow-auto">{item.element}</div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

export default SplitPanel
