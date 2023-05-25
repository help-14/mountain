import { Component, JSXElement, children } from 'solid-js'

const HStack: Component<{ children: JSXElement }> = props => {
  const resolved = children(() => props.children)

  return <div class="flex flex-row">{resolved}</div>
}

export default HStack
