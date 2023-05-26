import { Component, JSXElement, children } from 'solid-js'

const MenuLabel: Component<{ children: JSXElement }> = props => {
  const text = children(() => props.children)
  return <p class="uk-tile-secondary font-light italic p-2 pl-4">{text}</p>
}

export default MenuLabel
