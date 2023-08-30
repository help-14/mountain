import type { Component } from 'solid-js'
import HeaderMenu from './HeaderMenu'
import NavigationPanel from './NavigationPanel'
import ListingPanel from './ListingPanel'
import './css/index.css'

export const ManagePage: Component = () => {
  return (
    <div class="h-full w-100">
      <button
        data-drawer-target="sidebar"
        data-drawer-toggle="sidebar"
        aria-controls="sidebar"
        type="button"
        class="inline-flex items-center p-2 mt-2 ml-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
        <span class="sr-only">Open sidebar</span>
        <svg
          class="w-6 h-6"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg">
          <path
            clip-rule="evenodd"
            fill-rule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
        </svg>
      </button>

      <div class="fixed top-0 left-0 right-0 z-50 bg-900">
        <HeaderMenu />
      </div>

      <aside
        id="sidebar"
        class="fixed top-10 left-0 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Sidebar">
        <div class="h-full px-3 py-4 overflow-y-auto">
          <NavigationPanel />
        </div>
      </aside>

      <div class="p-4 pt-10 h-full sm:ml-64">
        <ListingPanel />
      </div>
    </div>
  )
}
