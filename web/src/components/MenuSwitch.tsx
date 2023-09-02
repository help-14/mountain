import { Component, JSXElement } from 'solid-js'

const MenuSwitch: Component<{ icon: JSXElement; label: string; value: boolean; valueChanged?: Function }> = props => {
  let checkbox: HTMLInputElement

  return (
    <div class="flex w-full">
      <div
        class="flex flex-row grow content-center items-center px-4 py-2 pr-0"
        onclick={() => {
          checkbox.checked = !checkbox.checked
          props.valueChanged?.(checkbox.checked)
        }}>
        {props.icon}
        <p class="ml-3">{props.label}</p>
      </div>
      <div class="flex items-center pr-4 py-2">
        <input
          ref={checkbox!}
          checked={props.value}
          type="checkbox"
          class="w-4 h-4 text-menu bg-900 border-menu rounded"
          onclick={() => props.valueChanged?.(checkbox.checked)}
        />
      </div>
    </div>
  )
}

export default MenuSwitch
