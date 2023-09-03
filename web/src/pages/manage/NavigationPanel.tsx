import { Component, For } from 'solid-js'
import { SourceProvider, SourceType } from '../../types/sourceProvider'
import { createStore } from 'solid-js/store'
import TreeView from '../../components/TreeView'
import { NodeType, createTreeNode } from '../../types/treeNode'

const NavigationPanel: Component<{}> = props => {
  const [sources, setSources] = createStore<SourceProvider[]>([
    {
      id: 'local',
      name: 'local',
      type: SourceType.Local,
    },
  ])

  return (
    <div class="container uk-width-2-5">
      <For each={sources}>
        {source => {
          return (
            <div>
              <TreeView
                rootNode={<div>root Node</div>}
                rootData={createTreeNode({
                  title: '1',
                  icon: '',
                  data: '',
                })}
                loadMore={(node: NodeType) => {
                  node.setChildren([
                    createTreeNode({
                      title: (parseInt(node.title) + 1).toString(),
                      icon: '',
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
