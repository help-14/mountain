import { Component } from 'solid-js'
import { FileInfo } from '../../types/FileInfo'
import FileExtensionIcon from '../FileExtensionIcon'

import './style.css'
import { humanFileSize } from '../../utils/format'

const ItemTileDisplay: Component<{
  info: FileInfo
  handleClick?: Function
}> = ({ info, handleClick }) => {
  let additionalInfo = info.directory ? '' : humanFileSize(info.size)

  return (
    <div
      style={{ width: '250px' }}
      class="item flex flex-row hover:bg-hover cursor-pointer p-4 rounded-lg"
      onClick={e => handleClick?.(e.currentTarget, info)}>
      <div class="self-center">
        <FileExtensionIcon directory={info.directory} ext={info.ext} />
      </div>
      <div class="flex flex-col content-center items-start self-center ml-3">
        <p class="text-code">{info.name}</p>
        <p class="text-menu italic text-sm">{additionalInfo}</p>
      </div>
    </div>
  )
}

export default ItemTileDisplay
