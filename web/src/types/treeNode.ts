import { Accessor, Setter, createSignal } from 'solid-js'

export type NodeType = {
  title: string
  icon: any
  data: any
  children: Accessor<NodeType[]>
  setChildren: Setter<NodeType[]>
}

export function createTreeNode(data: { title: string; icon: any; data: any }): NodeType {
  const [children, setChildren] = createSignal<NodeType[]>([])

  return {
    ...data,
    children,
    setChildren,
  }
}
