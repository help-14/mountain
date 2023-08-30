import { Component, For, Switch, Match, createEffect, createSignal } from 'solid-js'
import { doGetFilesFromPath } from '../../utils/network'
import ItemTileDisplay from '../../components/ItemDisplay/tile'
import ItemListDisplay from '../../components/ItemDisplay/list'
import { FileInfo } from '../../types/FileInfo'

const ListingPanel: Component<{}> = props => {
  const [files, setFiles] = createSignal([] as FileInfo[])
  const [location, setLocation] = createSignal('/Users/nhan/')
  const [viewMode, setViewMode] = createSignal('list')

  createEffect(() => {
    doGetFilesFromPath(location()).then(setFiles).catch(console.error)
  })

  return (
    <div>
      <Switch>
        <Match when={viewMode() === 'tile'}>
          <div class="flex flex-wrap gap-2 p-5 justify-left">
            <For each={files()}>{file => <ItemTileDisplay info={file} />}</For>
          </div>
        </Match>
        <Match when={viewMode() === 'list'}>
          <table class="table-auto w-full">
            <thead class="text-code">
              <tr>
                <th></th>
                <th></th>
                <th>Name</th>
                <th>SymLink</th>
                <th>Size</th>
                <th>Extension</th>
                <th>Modified at</th>
              </tr>
            </thead>
            <tbody>
              <For each={files()}>{file => <ItemListDisplay info={file} />}</For>
            </tbody>
          </table>
        </Match>
      </Switch>
    </div>
  )
}

export default ListingPanel
