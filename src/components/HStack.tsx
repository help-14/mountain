import { Component, JSXElement, children } from 'solid-js'

const HStack: Component<{ children: JSXElement; grow?: boolean; align?: string }> = props => {
  const resolved = children(() => props.children)

  return (
    <div
      classList={{
        'flex flex-row': true,
        'right-0': (() => props.align === 'right')(),
        grow: (() => props.grow === true)(),
      }}>
      {resolved()}
    </div>
  )
}

export default HStack
