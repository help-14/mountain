import { Component, For, JSXElement, children } from 'solid-js'

const MenuTrigger: Component<{ title: JSXElement; children: JSXElement }> = props => {
  const resolvedTitle = children(() => props.title)
  const resolvedChildren = children(() => props.children)
  const id = Math.random().toString(36).substring(2)

  return (
    <div>
      <button
        id={id}
        data-dropdown-toggle={'dd' + id}
        data-dropdown-delay="100"
        data-dropdown-trigger="hover"
        class="text-menu bg-900 hover:bg-hover focus:outline-none font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center"
        type="button">
        {resolvedTitle()}{' '}
        <svg
          class="w-4 h-4 ml-2"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div
        id={'dd' + id}
        class="z-10 hidden divide-y divide-gray-100 rounded-lg shadow w-48 bg-900 border-2 border-900">
        <ul class="py-2 text-sm text-menu" aria-labelledby={id}>
          <For each={resolvedChildren.toArray()}>
            {item => {
              if ((item as HTMLElement).tagName === 'P') {
                return item
              } else {
                return (
                  <li>
                    <a href="#" class="block px-4 py-2 hover:bg-hover">
                      {item}
                    </a>
                  </li>
                )
              }
            }}
          </For>
        </ul>
      </div>
    </div>
  )
}

export default MenuTrigger
