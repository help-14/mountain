import { Component, For, Switch, Match, createEffect, createSignal, Show } from 'solid-js'
import { doGetFilesFromPath } from '../../utils/network'
import ItemTileDisplay from '../../components/ItemDisplay/tile'
import ItemListDisplay from '../../components/ItemDisplay/list'
import { FileInfo } from '../../types/fileInfo'
import { createDropzone } from '@solid-primitives/upload'
import { FaSolidXmark } from 'solid-icons/fa'
import selectionModeSignal from '../../signals/selectionMode'
import viewModeSignal from '../../signals/viewMode'
import { sortData } from '../../utils/data'
import { sortSettings } from '../../utils/settings'
import selectionToolBus from '../../signals/selectionTool'

const ListingPanel: Component<{}> = props => {
  const [files, setFiles] = createSignal([] as FileInfo[])
  const [location, setLocation] = createSignal('/Users/nhan/')

  const [selectionMode, setSelectionMode] = selectionModeSignal
  const [viewMode, setViewMode] = viewModeSignal
  const [sort, setSort] = sortSettings()

  const { setRef: dropzone, files: droppedFiles } = createDropzone({
    onDrop: async files => {
      //await doStuff(2);
      files.forEach(f => console.log(f))
    },
    onDragStart: files => files.forEach(f => console.log(f)),
    onDragOver: files => console.log('drag over'),
  })

  createEffect(() => {
    doGetFilesFromPath(location())
      .then(data => setFiles(sortData(data, sort)))
      .catch(console.error)
  })

  const tileView = () => viewMode() === 'tile'
  const listView = () => viewMode() === 'list'

  selectionToolBus.listen(tool => {
    if (!selectionMode()) setSelectionMode(true)
  })

  return (
    <div ref={dropzone}>
      <Switch>
        <Match when={tileView()}>
          <div class="flex flex-wrap gap-2 p-5 justify-left">
            <For each={files()}>{file => <ItemTileDisplay info={file} />}</For>
          </div>
        </Match>
        <Match when={listView()}>
          <div>
            <div class="flex flex-row p-3 text-lg bg-900">
              <div class="basis-10 items-center flex">
                <Show when={selectionMode()}>
                  <FaSolidXmark fill="#849289" class="cursor-pointer mx-auto" onclick={() => setSelectionMode(false)} />
                </Show>
              </div>
              <div class="basis-10 "></div>
              <div class="grow px-3 contents-center self-center">
                <p class="text-menu font-bold px-5">File name</p>
              </div>
              <div class="basis-40 contents-center self-center text-center">
                <p class="text-menu font-bold px-5">Symlink</p>
              </div>
              <div class="basis-1/6 contents-center self-center">
                <p class="text-menu font-bold px-5">Size</p>
              </div>
              <div class="basis-1/6 contents-center self-center">
                <p class="text-menu font-bold px-5">File extension</p>
              </div>
              <div class="basis-1/4 contents-center self-center">
                <p class="text-menu font-bold px-5">Modified at</p>
              </div>
            </div>
            <For each={files()}>{(file, i) => <ItemListDisplay info={file} bgHighlight={i() % 2 !== 0} />}</For>
          </div>
          {/* </tbody>
          </table> */}
        </Match>
      </Switch>
    </div>
  )
}

export default ListingPanel
