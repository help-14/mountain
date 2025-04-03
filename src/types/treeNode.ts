import { Accessor, Setter, createSignal } from 'solid-js'

export type NodeType = {
  title: string
  data: any
  children: Accessor<NodeType[]>
  setChildren: Setter<NodeType[]>
  expanded: Accessor<boolean>
  setExpand: Setter<boolean>
}

export function createTreeNode(data: { title: string; data: any }): NodeType {
  const [children, setChildren] = createSignal<NodeType[]>([])
  const [expanded, setExpand] = createSignal<boolean>(false)

  return {
    ...data,
    children,
    setChildren,
    expanded,
    setExpand,
  }
}
