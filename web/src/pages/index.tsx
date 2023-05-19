/* @refresh reload */
import { render } from 'solid-js/web'
import { HopeProvider, HopeThemeConfig } from '@hope-ui/solid'

import { ManagePage } from './manage'
import I18nProvider from '../components/I18nProvider'
import { languageData } from '../languages'
import SettingPage from './setting'
import Div100vh from 'solidjs-div-100vh'

const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?'
  )
}

const config: HopeThemeConfig = {
  lightTheme: {
    colors: {
      primary9: 'salmon',
    },
  },
}

render(() => {
  return (
    <HopeProvider config={config}>
      <I18nProvider dict={languageData} locale="en">
        <Div100vh>
          <ManagePage />
        </Div100vh>
      </I18nProvider>
    </HopeProvider>
  )
}, root!)
