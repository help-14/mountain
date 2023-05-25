import type { Component } from 'solid-js'
import HeaderMenu from './HeaderMenu'
import NavigationPanel from './NavigationPanel'
import ListingPanel from './ListingPanel'
import './css/index.css'

export const ManagePage: Component = () => {
  return (
    <div class="flex flex-col bg-gray-900 height h-full">
      <div class="flex-none">
        <HeaderMenu />
      </div>
      <div class="flex-auto">
        <NavigationPanel />
        <ListingPanel />
      </div>
    </div>
  )
}
