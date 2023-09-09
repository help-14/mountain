import { Component, For, JSXElement, Show } from 'solid-js'
import { SourceProvider, SourceType, createSourceProvider } from '../../types/sourceProvider'
import { createStore } from 'solid-js/store'
import TreeView from '../../components/TreeView'
import { NodeType, createTreeNode } from '../../types/treeNode'
import { FiHardDrive } from 'solid-icons/fi'
import { ImOnedrive } from 'solid-icons/im'
import { FaBrandsCloudflare, FaBrandsGoogleDrive, FaSolidQuestion, FaSolidShuttleSpace } from 'solid-icons/fa'
import { SiAmazons3 } from 'solid-icons/si'

const NavigationPanel: Component<{}> = props => {
  const [sources, setSources] = createStore<SourceProvider[]>([])

  const temp = [
    {
      id: 'local',
      title: 'Local',
      type: SourceType.Local,
    },
    {
      id: 'Onedrive',
      title: 'Onedrive',
      type: SourceType.OneDrive,
    },
    {
      id: 'CSloudflare',
      title: 'Cloudflare',
      type: SourceType.CloudflareR2,
    },
    {
      id: 'DetaDrive',
      title: 'DetaDrive',
      type: SourceType.DetaCollection,
    },
    {
      id: 'GoogleDrive',
      title: 'GoogleDrive',
      type: SourceType.GoogleDrive,
    },
    {
      id: 'AmazonS3',
      title: 'AmazonS3',
      type: SourceType.AmazonS3,
    },
  ].map(createSourceProvider)
  setSources(temp)

  const root = createTreeNode({
    title: '1',
    data: '',
  })
  root.setExpand(true)

  function getSourceIcon(type: SourceType): JSXElement {
    switch (type) {
      case SourceType.Local:
        return <FiHardDrive fill="#D3C6AA" />
      case SourceType.OneDrive:
        return <ImOnedrive fill="#D3C6AA" />
      case SourceType.GoogleDrive:
        return <FaBrandsGoogleDrive fill="#D3C6AA" />
      case SourceType.AmazonS3:
        return <SiAmazons3 fill="#D3C6AA" />
      case SourceType.CloudflareR2:
        return <FaBrandsCloudflare fill="#D3C6AA" />
      case SourceType.DetaCollection:
        return <FaSolidShuttleSpace fill="#D3C6AA" />
      default:
        return <FaSolidQuestion fill="#D3C6AA" />
    }
  }

  return (
    <div class="container uk-width-2-5">
      <For each={sources}>
        {source => {
          return (
            <div class="mt-5">
              <div class="flex flex-col text-code">
                <div class="m-0 p-0" onclick={() => source.setExpand(!source.expanded())}>
                  <div class="flex flex-row cursor-pointer hover:bg-500 px-2">
                    <div class="my-auto pr-2">{getSourceIcon(source.type)}</div>
                    <span class="my-auto py-2 font-bold">{source.title}</span>
                  </div>
                </div>
                <Show when={source.expanded()}>
                  <For each={source.children()}>
                    {child => (
                      <TreeView
                        rootData={child}
                        loadMore={(node: NodeType | SourceProvider) => {
                          node.setChildren([
                            createTreeNode({
                              title: Math.random().toString(),
                              data: '',
                            }),
                          ])
                          return node
                        }}
                      />
                    )}
                  </For>
                </Show>
              </div>
            </div>
          )
        }}
      </For>
    </div>
  )
}

export default NavigationPanel
