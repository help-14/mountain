import type { Component } from 'solid-js'
import { Box } from '@hope-ui/solid'
import { useI18n } from '@solid-primitives/i18n'
import HeaderMenu from './HeaderMenu'

const App: Component = () => {
  const [t, { add, locale, dict }] = useI18n()
  return (
    <Box>
      <HeaderMenu />
    </Box>
  )
}

export default App
