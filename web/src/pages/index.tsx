/* @refresh reload */
import { render } from 'solid-js/web'
import { HopeProvider, HopeThemeConfig } from '@hope-ui/solid'

import './css/index.css'
import ManagePage from './manage'
import I18nProvider from '../components/I18nProvider'
import { languageData } from '../languages'
import { Route, Router } from '@solidjs/router'
import SettingPage from './setting'

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
        <Router>
          <Route path="/setting" component={SettingPage} />
          <Route path="/" component={ManagePage} />
        </Router>
      </I18nProvider>
    </HopeProvider>
  )
}, root!)
