import { Component, JSXElement, children } from 'solid-js'

const VStack: Component<{ children: JSXElement }> = props => {
  const resolved = children(() => props.children)

  return <div class="flex flex-col">{resolved()}</div>
}

export default VStack
