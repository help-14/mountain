import { createMemo } from 'solid-js'
import { languageData } from '../languages'
import * as i18n from '@solid-primitives/i18n'
import { languageSettings } from '../utils/settings'

const [langSettings, _] = languageSettings()
const dict = createMemo(() => i18n.flatten(languageData[langSettings.language ?? 'en']))

export const t = i18n.translator(dict)
