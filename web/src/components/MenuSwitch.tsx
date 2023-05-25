import { Component, JSXElement, children } from 'solid-js'

const MenuSwitch: Component<{ children: JSXElement }> = props => {
  const childs = children(() => props.children)

  return (
    <div class="flex p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
      <label class="relative inline-flex items-center w-full cursor-pointer">
        {childs}
        <input type="checkbox" value="" class="sr-only peer" />
      </label>
    </div>
  )
}

export default MenuSwitch
