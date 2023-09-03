import { Component, JSXElement } from 'solid-js'

const IconLabel: Component<{
  icon: JSXElement
  label: string
  responsive?: boolean
  padding?: boolean
  handleClick?: Function
}> = ({ icon, label, handleClick, padding, responsive }) => {
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
      <p
        classList={{
          'ml-3': true,
          'sm:inline': responsive ?? false,
          hidden: responsive ?? false,
        }}>
        {label}
      </p>
    </div>
  )
}

export default IconLabel
