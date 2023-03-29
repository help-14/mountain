import type { Component } from 'solid-js'
import { Box, Flex } from '@hope-ui/solid'
import { useI18n } from '@solid-primitives/i18n'
import HeaderMenu from './HeaderMenu'
import NavigationPanel from './NavigationPanel'
import ListingPanel from './ListingPanel'

const ManagePage: Component = () => {
  return (
    <Box>
      <HeaderMenu />
      <Flex w="$full" height="calc(100vh - 64px)">
        <NavigationPanel />
        <ListingPanel />
      </Flex>
    </Box>
  )
}

export default ManagePage
