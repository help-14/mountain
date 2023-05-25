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
    <div class="container">
      <div class="grid grid-flow-col auto-cols-max">
        <For each={files()}>{file => <ItemDisplay info={file} />}</For>
      </div>
    </div>
  )
}

export default ListingPanel
