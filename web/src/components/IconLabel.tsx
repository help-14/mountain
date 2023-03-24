import { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { HStack, Text } from '@hope-ui/solid'
import Fa from 'solid-fa'
import { Component } from 'solid-js'

const IconLabel: Component<{
  icon: IconDefinition
  label: string
}> = props => {
  return (
    <HStack spacing="$3">
      <Fa icon={props.icon} />
      <Text>{props.label}</Text>
    </HStack>
  )
}

export default IconLabel
