import { Component, For, JSXElement, Show } from 'solid-js'
import { VsTriangleRight, VsTriangleDown } from 'solid-icons/vs'
import { NodeType } from '../types/treeNode'
import { FaSolidFolder } from 'solid-icons/fa'

const TreeView: Component<{ rootNode: JSXElement; rootData: NodeType; loadMore: Function }> = ({
  rootNode,
  rootData,
  loadMore,
}) => {
  function onSelect(nodeData: NodeType, allowCollapse = false) {
    if (nodeData.expanded()) {
      //nodeData.setExpand(false)
    } else {
      if (nodeData.children().length === 0) loadMore?.(nodeData)
      nodeData.setExpand(true)
    }
  }

  function renderChildren(nodeData: NodeType): JSXElement {
    return (
      <div class="flex flex-col">
        <div class="flex flex-row cursor-pointer hover:bg-500" title={nodeData.title}>
          <span class="my-auto p-2">
            <Show when={!nodeData.expanded()}>
              <VsTriangleRight onclick={() => onSelect(nodeData)} />
            </Show>
            <Show when={nodeData.expanded()}>
              <VsTriangleDown onclick={() => nodeData.setExpand(false)} />
            </Show>
          </span>
          <span class="my-auto p-2 pl-0" onclick={() => onSelect(nodeData)}>
            <FaSolidFolder size="1em" fill="#f7cd00" class="ml-auto" />
          </span>
          <span class="my-auto p-2 pl-0 grow truncate" onclick={() => onSelect(nodeData)}>
            {nodeData.title}
          </span>
        </div>
        <Show when={nodeData.expanded()}>
          <For each={nodeData.children()}>{child => <div class="flex flex-col ml-4">{renderChildren(child)}</div>}</For>
        </Show>
      </div>
    )
  }

  return (
    <div class="flex flex-col text-code">
      <div class="m-0 p-0" onclick={() => rootData.setExpand(!rootData.expanded())}>
        {rootNode}
      </div>
      <Show when={rootData.expanded()}>{renderChildren(rootData)}</Show>
    </div>
  )
}

export default TreeView
