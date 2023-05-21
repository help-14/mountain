import { HStack, Text, VStack } from '@hope-ui/solid'
import { Component, Show } from 'solid-js'
import { FileInfo } from '../types/FileInfo'
import FileExtensionIcon from './FileExtensionIcon'
import { FaSolidFolder } from 'solid-icons/fa'

const ItemDisplay: Component<{
  info: FileInfo
}> = ({ info }) => {
  return (
    <HStack margin="$3">
      <FileExtensionIcon directory={info.directory} ext={info.ext} />
      <VStack paddingLeft="$3">
        <Text>{info.name}</Text>
        <Text>{info.size}</Text>
      </VStack>
    </HStack>
  )
}

export default ItemDisplay
