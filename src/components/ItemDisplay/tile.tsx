import { Component, Show, createEffect, createSignal } from 'solid-js'
import { FileInfo } from '../../types/fileInfo'
import FileExtensionIcon from '../FileExtensionIcon'
import selectionModeSignal from '../../signals/selectionMode'
import './style.css'
import { humanFileSize } from '../../utils/format'
import selectionToolBus from '../../signals/selectionTool'

const ItemTileDisplay: Component<{
  info: FileInfo
  handleClick?: Function
}> = ({ info, handleClick }) => {
  let additionalInfo = info.directory ? '' : humanFileSize(info.size)
  let selectBox: HTMLInputElement

  const [selectionMode, setSelectionMode] = selectionModeSignal
  const [selected, setSelected] = createSignal(false)

  createEffect(() => (info.selected = selected()))

  selectionToolBus.listen(tool => {
    switch (tool) {
      case 'all':
        setSelected(true)
        break
      case 'none':
        setSelected(false)
        break
      case 'invert':
        setSelected(!selected())
        break
    }
  })

  return (
    <div
      classList={{
        'item flex flex-row hover:bg-hover cursor-pointer p-4 rounded-lg box-border': true,
        'border-2 border-active': selected(),
      }}
      style={{ width: '280px', margin: selected() ? '0px' : '2px', 'margin-right': selected() ? '4px' : '2px' }}
      onClick={e => handleClick?.(e.currentTarget, info)}>
      <Show when={selectionMode()}>
        <input
          ref={selectBox!}
          type="checkbox"
          onclick={() => setSelected(selectBox.checked)}
          checked={selected()}
          class="w-4 h-4 mr-3 my-auto text-menu bg-900 border-menu focus:ring-menu rounded"
        />
      </Show>
      <div class="self-center">
        <FileExtensionIcon directory={info.directory} ext={info.ext} />
      </div>
      <div class="flex w-full flex-col content-center items-start self-center ml-3">
        <p class="text-code truncate">{info.name}</p>
        <p class="text-menu italic text-sm">{additionalInfo}</p>
      </div>
    </div>
  )
}

export default ItemTileDisplay
