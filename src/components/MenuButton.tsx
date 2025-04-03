import { Component, For, JSXElement, children } from 'solid-js'

const MenuButton: Component<{ title: JSXElement }> = props => {
  const resolvedTitle = children(() => props.title)
  const id = Math.random().toString(36).substring(2)

  return (
    <div>
      <button
        id={id}
        class="text-menu bg-900 hover:bg-hover focus:outline-none font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center"
        type="button">
        {resolvedTitle()}
      </button>
    </div>
  )
}

export default MenuButton
