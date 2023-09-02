import { Component, JSXElement } from 'solid-js'

const IconLabel: Component<{
  icon: JSXElement
  label: string
  padding?: boolean
  handleClick?: Function
}> = ({ icon, label, handleClick, padding }) => {
  return (
    <div
      classList={{
        flex: true,
        'flex-row': true,
        'content-center': true,
        'items-center': true,
        'px-4': padding ?? false,
        'py-2': padding ?? false,
      }}
      onClick={e => handleClick?.(e.currentTarget)}>
      {icon}
      <p class="ml-3">{label}</p>
    </div>
  )
}

export default IconLabel
