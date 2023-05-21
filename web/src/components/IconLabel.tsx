import { HStack, Text } from '@hope-ui/solid'
import { Component, JSX } from 'solid-js'

const IconLabel: Component<{
  icon: JSX.Element
  label: string
}> = ({ icon, label }) => {
  return (
    <HStack spacing="$3">
      {icon}
      <Text>{label}</Text>
    </HStack>
  )
}

export default IconLabel
