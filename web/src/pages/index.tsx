/* @refresh reload */
import { render } from 'solid-js/web'
import { ManagePage } from './manage'
import I18nProvider from '../components/I18nProvider'
import { languageData } from '../languages'
import Div100vh from 'solidjs-div-100vh'
import './index.css'
import 'flowbite'
import { languageSettings } from '../utils/settings'

const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?'
  )
}

render(() => {
  const [langSettings, _] = languageSettings()

  return (
    <I18nProvider dict={languageData} locale={langSettings.language}>
      <Div100vh>
        <ManagePage />
      </Div100vh>
    </I18nProvider>
  )
}, root!)
