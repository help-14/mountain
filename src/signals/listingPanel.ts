import { createEventBus } from '@solid-primitives/event-bus'
import { createSignal } from 'solid-js'

export default {
  newPanel: createEventBus<string>(),
  roomAvailable: createSignal(true),
}
