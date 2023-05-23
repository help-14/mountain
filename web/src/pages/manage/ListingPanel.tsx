import { Box, SimpleGrid, Stack, Text } from '@hope-ui/solid'
import { Component, For, createEffect, createSignal } from 'solid-js'
import { doGetFilesFromPath } from '../../utils/network'
import ItemDisplay from '../../components/ItemDisplay/component'
import { FileInfo } from '../../types/FileInfo'

const ListingPanel: Component<{}> = props => {
  const [files, setFiles] = createSignal([] as FileInfo[])
  const [location, setLocation] = createSignal('/Users/nhan/')
  createEffect(() => {
    doGetFilesFromPath(location()).then(setFiles).catch(console.error)
  })

  return (
    <Box h="$full" w="$full" bg="$neutral2" class="item">
      <SimpleGrid minChildWidth="250px" gap="10px">
        <For each={files()}>{file => <ItemDisplay info={file} />}</For>
      </SimpleGrid>
    </Box>
  )
}

export default ListingPanel
