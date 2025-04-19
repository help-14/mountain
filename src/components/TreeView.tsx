import { Component, For, JSXElement, Show } from "solid-js";
import { NodeType } from "~/types";
import { VsTriangleRight, VsTriangleDown } from "solid-icons/vs";
import { FaSolidFolder } from "solid-icons/fa";

const TreeView: Component<{ rootData: NodeType; loadMore: Function }> = ({
  rootData,
  loadMore,
}) => {
  function onSelect(nodeData: NodeType, allowCollapse = false) {
    if (nodeData.expanded()) {
      if (allowCollapse) nodeData.setExpand(false);
    } else {
      if (nodeData.children().length === 0) loadMore?.(nodeData);
      nodeData.setExpand(true);
    }
  }

  function renderChildren(nodeData: NodeType): JSXElement {
    return (
      <div class="flex flex-col">
        <div
          class="flex flex-row cursor-pointer hover:bg-500"
          title={nodeData.title}
        >
          <span class="my-auto p-2">
            <Show when={!nodeData.expanded()}>
              <VsTriangleRight onclick={() => onSelect(nodeData)} />
            </Show>
            <Show when={nodeData.expanded()}>
              <VsTriangleDown onclick={() => nodeData.setExpand(false)} />
            </Show>
          </span>
          <span
            class="my-auto p-2 pl-0"
            onclick={() => onSelect(nodeData)}
            onDblClick={() => onSelect(nodeData, true)}
          >
            <FaSolidFolder size="1em" fill="#f7cd00" class="ml-auto" />
          </span>
          <span
            class="my-auto p-2 pl-0 grow truncate"
            onclick={() => onSelect(nodeData)}
            onDblClick={() => onSelect(nodeData, true)}
          >
            {nodeData.title}
          </span>
        </div>
        <Show when={nodeData.expanded()}>
          <For each={nodeData.children()}>
            {(child) => (
              <div class="flex flex-col ml-4">{renderChildren(child)}</div>
            )}
          </For>
        </Show>
      </div>
    );
  }

  return renderChildren(rootData);
};

export default TreeView;
