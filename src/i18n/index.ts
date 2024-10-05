import type { InitOptions } from 'i18next'

// Импорт JSON-файлов с переводами
import enJson from '@/i18n/locales/en.json'
import jaJson from '@/i18n/locales/ja.json'
import ruJson from '@/i18n/locales/ru.json'

// Определение пространства имен по умолчанию
export const defaultNS = 'translation'

// Объект ресурсов с переводами для каждого языка
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

// Настройки инициализации для i18next
export const initOptions: InitOptions = {
  // Включение режима отладки
  debug: true,
  
  // Язык по умолчанию
  lng: 'en',
  
  // Резервный язык, если перевод не найден
  fallbackLng: 'en',
  
  // Поддерживаемые языки
  supportedLngs: ['en', 'ja', 'ru'],
  
  // Пространство имен по умолчанию
  defaultNS,
  
  // Ресурсы с переводами
  resources,
  
  // Настройки интерполяции
  interpolation: {
    // Отключение экранирования значений
    escapeValue: false,
  },
  
  // Использование совместимого формата JSON
  compatibilityJSON: 'v3',
}