import { Component, For, JSXElement, Show } from 'solid-js'
import { VsTriangleRight, VsTriangleDown } from 'solid-icons/vs'
import { NodeType } from '../types/treeNode'

const TreeView: Component<{ rootNode: JSXElement; rootData: NodeType; loadMore: Function }> = ({
  rootNode,
  rootData,
  loadMore,
}) => {
  function renderChildren(nodeData: NodeType): JSXElement {
    return (
      <div class="flex flex-col">
        <div class="my-2 p-2 flex flex-row cursor-pointer hover:bg-active" onclick={() => loadMore(nodeData)}>
          <span class="my-auto mr-2">
            <VsTriangleRight />
          </span>
          <span class="my-auto mr-2">{nodeData.icon}</span>
          <span class="my-auto">{nodeData.title}</span>
        </div>
        <For each={nodeData.children()}>{child => <div class="flex flex-col ml-4">{renderChildren(child)}</div>}</For>
      </div>
    )
  }

  return (
    <div class="flex flex-col text-code">
      <div onclick={loadMore(rootData)}>{rootNode}</div>
      {renderChildren(rootData)}
    </div>
  )
}

export default TreeView
