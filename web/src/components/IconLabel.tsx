import { Component, JSXElement } from 'solid-js'

const IconLabel: Component<{
  icon: JSXElement
  label: string
  handleClick?: Function
}> = ({ icon, label, handleClick }) => {
  return (
    <div class="flex flex-row content-center items-center" onClick={e => handleClick?.(e.currentTarget)}>
      {icon}
      <p class="ml-3">{label}</p>
    </div>
  )
}

export default IconLabel
