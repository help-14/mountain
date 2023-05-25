import { Component } from 'solid-js'
import { FileInfo } from '../../types/FileInfo'
import FileExtensionIcon from '../FileExtensionIcon'
import HStack from '../HStack'
import VStack from '../VStack'

import './style.css'

const ItemDisplay: Component<{
  info: FileInfo
}> = ({ info }) => {
  return (
    <div class="item">
      <HStack>
        <FileExtensionIcon directory={info.directory} ext={info.ext} />
        <VStack>
          <p>{info.name}</p>
          <p>{info.size}</p>
        </VStack>
      </HStack>
    </div>
  )
}

export default ItemDisplay
