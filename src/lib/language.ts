import { createMemo } from 'solid-js'
import { languageData } from '~/languages'
import * as i18n from '@solid-primitives/i18n'

const dict = createMemo(() => i18n.flatten(languageData['en']))

export const t = i18n.translator(dict)
