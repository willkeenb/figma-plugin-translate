import type { InitOptions } from 'i18next'

import enJson from '@/i18n/locales/en.json'
import jaJson from '@/i18n/locales/ja.json'
import ruJson from '@/i18n/locales/ru.json'

export const defaultNS = 'translation'

export const resources = {
  en: {
    [defaultNS]: enJson,
  },
  ja: {
    [defaultNS]: jaJson,
  },
  ru: {
    [defaultNS]: ruJson,
  },
} as const

export const initOptions: InitOptions = {
  debug: true,
  lng: 'en',
  defaultNS,
  resources,
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v3',
}
