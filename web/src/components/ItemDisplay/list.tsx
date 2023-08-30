import { Component, Show, createEffect, createSignal } from 'solid-js'
import { FileInfo } from '../../types/FileInfo'
import FileExtensionIcon from '../FileExtensionIcon'
import { VsLink } from 'solid-icons/vs'
import './style.css'
import { humanFileSize } from '../../utils/format'

const ItemListDisplay: Component<{
  info: FileInfo
  handleClick?: Function
}> = ({ info, handleClick }) => {
  const [selected, setSelected] = createSignal(false)
  const [editMode, setEditMode] = createSignal(false)
  const [fileName, setFileName] = createSignal(info.name)

  let fileNameTb: HTMLInputElement

  createEffect(() => {
    info.selected = selected()
    info.name = fileName()
    if (editMode()) fileNameTb.focus()
  })

  let size = () => (info.directory ? '' : humanFileSize(info.size))
  let modified = () => new Date(info.modified).toLocaleString()
  let isLinked = () => info.symlink

  return (
    <tr class="item hover:bg-hover cursor-pointer p-2" onClick={e => handleClick?.(e.currentTarget, info)}>
      <td class="self-center content-center pl-3">
        <input type="checkbox" class="w-4 h-4 text-menu bg-900 border-menu focus:ring-menu rounded" />
      </td>
      <td>
        <FileExtensionIcon directory={info.directory} ext={info.ext} fileSize="1em" iconSize="0" />
      </td>
      <td class="content-center self-center pl-3 pr-5" ondblclick={() => setEditMode(!editMode())}>
        <Show when={!editMode()}>
          <p class="text-code">{fileName()}</p>
        </Show>
        <Show when={editMode()}>
          <input
            class="border-none focus:border-none bg-transparent text-code caret-code w-full"
            ref={fileNameTb!}
            type="textbox"
            value={fileName()}
            oninput={() => setFileName(fileNameTb.value)}
            onfocus={() => fileNameTb.select()}
            onfocusout={() => setEditMode(false)}
          />
        </Show>
      </td>
      <td class="content-center">
        <Show when={isLinked()}>
          <VsLink fill="#D3C6AA" class="mx-auto" />
        </Show>
      </td>
      <td class="content-center self-center text-center">
        <p class="text-code pl-5 pr-5 shrink">{size()}</p>
      </td>
      <td class="content-center self-center text-center">
        <p class="text-code pl-5 pr-5 shrink">{info.ext}</p>
      </td>
      <td class="content-center self-center text-center">
        <p class="text-code pl-5 pr-5 shrink">{modified()}</p>
      </td>
    </tr>
  )
}

export default ItemListDisplay
