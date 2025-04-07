import { Component, For, Switch, Match, createEffect, createSignal, Show, onMount } from 'solid-js'
import { doGetFilesFromPath } from '../utils/network'
import ItemTileDisplay from './ItemDisplay/tile'
import ItemListDisplay from './ItemDisplay/list'
import { FileInfo } from '../types/fileInfo'
import { FaSolidXmark } from 'solid-icons/fa'
import selectionModeSignal from '../signals/selectionMode'
import viewModeSignal from '../signals/viewMode'
import { sortData } from '../utils/data'
import { sortSettings } from '../utils/settings'
import selectionToolBus from '../signals/selectionTool'
import compactModeBus from '../signals/compactMode'
import { setupContextMenu } from '../utils/contextMenu'
import IconLabel from './IconLabel'
import { OcPaste3, OcTabexternal2 } from 'solid-icons/oc'
import { IoCopyOutline, IoCut } from 'solid-icons/io'
import { AiOutlineDelete } from 'solid-icons/ai'
import { BiRegularShare } from 'solid-icons/bi'
import listingSignal from '../signals/listingPanel'

const ListingPanel: Component = () => {
  const [files, setFiles] = createSignal([] as FileInfo[])
  const [location, setLocation] = createSignal('/Users/nhan/')
  const [compact, setCompact] = createSignal(false)

  const [selectionMode, setSelectionMode] = selectionModeSignal
  const [viewMode, setViewMode] = viewModeSignal
  const [sort, setSort] = sortSettings()
  const [roomAvailable, _] = listingSignal.roomAvailable

  createEffect(() => {
    doGetFilesFromPath(location())
      .then(data => setFiles(sortData(data, sort)))
      .catch(console.error)
  })

  const tileView = () => viewMode() === 'tile'
  const listView = () => viewMode() === 'list'

  selectionToolBus.listen(() => {
    if (!selectionMode()) setSelectionMode(true)
  })

  let zone: HTMLDivElement | null = null
  let menu: HTMLDivElement | null = null
  compactModeBus.listen(val => setCompact(val))

  function setup() {
    if (!zone || !menu) setTimeout(setup, 100)
    setupContextMenu(zone, menu)
  }
  setup()

  return (
    <div>
      <div ref={zone!}>
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
                    <FaSolidXmark
                      fill="#849289"
                      class="cursor-pointer mx-auto"
                      onclick={() => setSelectionMode(false)}
                    />
                  </Show>
                </div>
                <div class="basis-10 "></div>
                <div class="grow px-3 contents-center self-center">
                  <p class="text-menu font-bold px-5">File name</p>
                </div>
                <Show when={!compact()}>
                  <div class="basis-40 contents-center self-center text-center xl:inline hidden">
                    <p class="text-menu font-bold px-5">Symlink</p>
                  </div>
                </Show>
                <div class="basis-1/6 contents-center self-center">
                  <p class="text-menu font-bold px-5">Size</p>
                </div>
                <Show when={!compact()}>
                  <div class="basis-1/6 contents-center self-center xl:inline hidden">
                    <p class="text-menu font-bold px-5">File extension</p>
                  </div>
                  <div class="basis-1/4 contents-center self-center">
                    <p class="text-menu font-bold px-5">Modified at</p>
                  </div>
                </Show>
              </div>
              <For each={files()}>{(file, i) => <ItemListDisplay info={file} bgHighlight={i() % 2 !== 0} />}</For>
            </div>
          </Match>
        </Switch>
      </div>

      <div ref={menu!} class="z-10 hidden rounded divide-y divide-gray-100 shadow bg-500 border-2 border-menu">
        <ul class="py-1 text-code text-base">
          <Show when={roomAvailable()}>
            <li>
              <a href="#" class="p-2 block hover:bg-hover" onclick={() => listingSignal.newPanel.emit('')}>
                <IconLabel icon={<OcTabexternal2 />} label="New panel" />
              </a>
            </li>
          </Show>
          <li>
            <a href="#" class="p-2 block hover:bg-hover">
              <IconLabel icon={<IoCut />} label="Cut" />
            </a>
          </li>
          <li>
            <a href="#" class="p-2 block hover:bg-hover">
              <IconLabel icon={<IoCopyOutline />} label="Copy" />
            </a>
          </li>
          <li>
            <a href="#" class="p-2 block hover:bg-hover">
              <IconLabel icon={<OcPaste3 />} label="Paste" />
            </a>
          </li>
          <li>
            <a href="#" class="p-2 block hover:bg-hover">
              <IconLabel icon={<BiRegularShare />} label="Move" />
            </a>
          </li>
          <li>
            <a href="#" class="p-2 block hover:bg-hover">
              <IconLabel icon={<AiOutlineDelete />} label="Delete" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default ListingPanel
