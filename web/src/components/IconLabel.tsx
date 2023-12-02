import { Component, JSXElement } from 'solid-js'

const IconLabel: Component<{
  icon: JSXElement
  label: string | undefined
  responsive?: boolean
  padding?: boolean
  handleClick?: Function
}> = ({ icon, label, handleClick, padding, responsive }) => {
  return (
    <div
      classList={{
        'flex flex-row content-center items-center': true,
        'px-4 py-2': padding ?? false,
      }}
      onClick={e => handleClick?.(e.currentTarget)}>
      {icon}
      <p
        classList={{
          'ml-3': true,
          'sm:inline hidden': responsive ?? false,
        }}>
        {label}
      </p>
    </div>
  )
}

export default IconLabel
