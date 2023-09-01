import { SortSettings, LanguageSettings, ViewSettings } from '../types/setting'
import { createObjectStore } from './localStorage'

export const sortSettings = () =>
  createObjectStore<SortSettings>('setting.sort', {
    by: 'name',
  })

export const viewSettings = () =>
  createObjectStore<ViewSettings>('setting.view', {
    as: 'tile',
    navigation: true,
    preview: true,
    extension: true,
  })

export const languageSettings = () => createObjectStore<LanguageSettings>('setting.language', { language: 'en' })
