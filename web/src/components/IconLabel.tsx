import { Component, JSXElement } from 'solid-js'

const IconLabel: Component<{
  icon: JSXElement
  label: string
}> = ({ icon, label }) => {
  return (
    <div class="flex flex-row content-center items-center">
      {icon}
      <p class="ml-3">{label}</p>
    </div>
  )
}

export default IconLabel
