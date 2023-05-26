import { Component, JSXElement, children } from 'solid-js'

const MenuSwitch: Component<{ icon: JSXElement; label: string }> = props => {
  return (
    <div class="flex hover:bg-gray-100 dark:hover:bg-gray-600 w-full">
      <div class="flex flex-row grow content-center items-center">
        {props.icon}
        <p class="ml-3">{props.label}</p>
      </div>
      <div class="flex items-center">
        <input
          checked
          type="checkbox"
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
    </div>
  )
}

export default MenuSwitch
