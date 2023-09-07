import { Accessor, Setter, createSignal } from 'solid-js'
import { NodeType, createTreeNode } from './treeNode'

export type SourceProvider = {
  id: string
  title: string
  type: SourceType
  children: Accessor<NodeType[]>
  setChildren: Setter<NodeType[]>
  expanded: Accessor<boolean>
  setExpand: Setter<boolean>
}

export function createSourceProvider(data: { id: string; title: string; type: SourceType }): SourceProvider {
  const [children, setChildren] = createSignal<NodeType[]>([
    createTreeNode({
      title: '/',
      data: '',
    }),
  ])
  const [expanded, setExpand] = createSignal<boolean>(false)

  return {
    ...data,
    children,
    setChildren,
    expanded,
    setExpand,
  }
}

export enum SourceType {
  Local = 'local',
  OneDrive = 'onedrive',
  CloudflareR2 = 'cloudflare-r2',
  DetaCollection = 'deta',
  AmazonS3 = 'amazon-s3',
  GoogleDrive = 'google-drive',
}
