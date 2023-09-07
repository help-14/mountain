import { Component, For, JSXElement } from 'solid-js'
import { SourceProvider, SourceType } from '../../types/sourceProvider'
import { createStore } from 'solid-js/store'
import TreeView from '../../components/TreeView'
import { NodeType, createTreeNode } from '../../types/treeNode'
import { FiHardDrive } from 'solid-icons/fi'
import { ImOnedrive } from 'solid-icons/im'
import { FaBrandsCloudflare, FaBrandsGoogleDrive, FaSolidQuestion, FaSolidShuttleSpace } from 'solid-icons/fa'
import { SiAmazons3 } from 'solid-icons/si'

const NavigationPanel: Component<{}> = props => {
  const [sources, setSources] = createStore<SourceProvider[]>([
    {
      id: 'local',
      name: 'Local',
      type: SourceType.Local,
    },
    {
      id: 'Onedrive',
      name: 'Onedrive',
      type: SourceType.OneDrive,
    },
    {
      id: 'CSloudflare',
      name: 'Cloudflare',
      type: SourceType.CloudflareR2,
    },
    {
      id: 'DetaDrive',
      name: 'DetaDrive',
      type: SourceType.DetaCollection,
    },
    {
      id: 'GoogleDrive',
      name: 'GoogleDrive',
      type: SourceType.GoogleDrive,
    },
    {
      id: 'AmazonS3',
      name: 'AmazonS3',
      type: SourceType.AmazonS3,
    },
  ])

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
              <TreeView
                rootNode={
                  <div class="flex flex-row cursor-pointer hover:bg-500 px-2">
                    <div class="my-auto pr-2">{getSourceIcon(source.type)}</div>
                    <span class="my-auto py-2">{source.name}</span>
                  </div>
                }
                rootData={root}
                loadMore={(node: NodeType) => {
                  node.setChildren([
                    createTreeNode({
                      title: (parseInt(node.title) + 1).toString(),
                      data: '',
                    }),
                  ])
                  return node
                }}
              />
            </div>
          )
        }}
      </For>
    </div>
  )
}

export default NavigationPanel
