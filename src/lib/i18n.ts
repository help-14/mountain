import * as i18n from "@solid-primitives/i18n"
import { createMemo, createRoot } from "solid-js"
import { languageData, type Locale } from "~/languages"
import { settings } from "~/stores/settings"
import { formatString } from "./format"

type Flat = i18n.Flatten<(typeof languageData)["en"]>
export type TranslationKey = { [K in keyof Flat]: Flat[K] extends string ? K : never }[keyof Flat]

const flatDicts = Object.fromEntries(
  Object.entries(languageData).map(([k, v]) => [k, i18n.flatten(v)]),
) as Record<Locale, Flat>

const dict = createRoot(() => createMemo(() => flatDicts[settings.prefs.language] ?? flatDicts.en))

/** Translate a key; `{0}`, `{1}` placeholders are replaced by the extra arguments. */
export function t(key: TranslationKey, ...args: (string | number)[]): string {
  const value = (dict()[key] ?? flatDicts.en[key] ?? key) as string
  return args.length ? formatString(value, ...args) : value
}

export const locale = () => settings.prefs.language
export const locales = Object.entries(languageData).map(([id, d]) => ({ id: id as Locale, name: d.language, flag: d.flag }))
