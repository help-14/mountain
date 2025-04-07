import { Component, For } from 'solid-js'
import { Locale, languageData } from '../languages'
import { languageSettings } from '../utils/settings'
import { refreshPage } from '../utils/ui'
import { t } from '../utils/language'

const LanguageSelector: Component = () => {
  const langValue = Object.entries(languageData)
  const data = langValue.map(([key, value]) => ({
    id: key,
    title: value.language,
    flag: value.flag,
  }))

  const [langSetting, setLangSetting] = languageSettings()

  const setLanguage = (id: Locale) => {
    setLangSetting({ ...langSetting, language: id })
    refreshPage()
  }

  return (
    <div
      id="drawer-language"
      class="fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto transition-transform translate-x-full w-80 bg-500"
      tabindex="-1"
      aria-labelledby="drawer-right-label">
      <h5 class="inline-flex items-center mb-4 text-base font-semibold text-code">{t('header.setting.language')}</h5>
      <div class="grid grid-cols-1">
        <For each={data}>
          {lang => (
            <a href="#" class="block px-4 py-2 hover:bg-hover text-code" onclick={() => setLanguage(lang.id as Locale)}>
              {lang.flag + ' ' + lang.title}
            </a>
          )}
        </For>
      </div>
    </div>
  )
}

export default LanguageSelector
