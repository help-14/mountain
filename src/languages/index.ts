import { en } from './en'
import { vi } from './vi'
import { ru } from './ru'

export const languageData = {
  en,
  vi,
  ru,
}

export type Locale = keyof typeof languageData
