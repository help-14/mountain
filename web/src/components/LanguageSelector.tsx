import { Component, For } from 'solid-js'
import { languageData } from '../languages'
import { languageSettings } from '../utils/settings'

const LanguageSelector: Component = () => {
  const langValue = Object.entries(languageData)
  const data = langValue.map(([key, value]) => ({
    id: key,
    title: value.language,
    flag: value.flag,
  }))

  const [langSetting, setLangSetting] = languageSettings()

  const setLanguage = (id: string) => {
    setLangSetting({ ...langSetting, language: id })
    location.reload()
  }

  return (
    <ul>
      <For each={data}>
        {lang => (
          <li>
            <button class="text-code" onclick={() => setLanguage(lang.id)}>
              {lang.flag + ' ' + lang.title}
            </button>
          </li>
        )}
      </For>
    </ul>
  )
}

export default LanguageSelector
