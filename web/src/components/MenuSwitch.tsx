import { Component, JSXElement, children } from 'solid-js'

const MenuSwitch: Component<{ icon: JSXElement; label: string }> = props => {
  return (
    <div class="flex w-full">
      <div class="flex flex-row grow content-center items-center">
        {props.icon}
        <p class="ml-3">{props.label}</p>
      </div>
      <div class="flex items-center">
        <input checked type="checkbox" class="w-4 h-4 text-menu bg-900 border-menu rounded" />
      </div>
    </div>
  )
}

export default MenuSwitch
