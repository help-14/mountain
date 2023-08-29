import { Component } from 'solid-js'
import { FileInfo } from '../../types/FileInfo'
import FileExtensionIcon from '../FileExtensionIcon'
import HStack from '../HStack'

import './style.css'

const ItemDisplay: Component<{
  info: FileInfo
}> = ({ info }) => {
  return (
    <div class="item flex flex-row hover:bg-hover cursor-pointer p-4 rounded-lg">
      <div class="self-center">
        <FileExtensionIcon directory={info.directory} ext={info.ext} />
      </div>
      <div class="flex flex-col content-center items-center self-center	ml-3">
        <p class="text-code">{info.name}</p>
        {/* <p class="dark:text-white">{info.size}</p> */}
      </div>
    </div>
  )
}

export default ItemDisplay
