import { Box, HStack, Text, VStack } from '@hope-ui/solid'
import { Component } from 'solid-js'
import { FileInfo } from '../../types/FileInfo'
import FileExtensionIcon from '../FileExtensionIcon'

import './style.css'

const ItemDisplay: Component<{
  info: FileInfo
}> = ({ info }) => {
  return (
    <Box class="item" borderRadius="$lg" _hover={{ bgColor: '$primary3' }}>
      <HStack margin="$3">
        <FileExtensionIcon directory={info.directory} ext={info.ext} />
        <VStack paddingLeft="$3">
          <Text noOfLines={1}>{info.name}</Text>
          <Text>{info.size}</Text>
        </VStack>
      </HStack>
    </Box>
  )
}

export default ItemDisplay
