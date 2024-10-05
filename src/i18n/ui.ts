import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { initOptions } from '@/i18n'

// Создание отдельного экземпляра i18n для пользовательского интерфейса
const i18nForUI = i18n.createInstance()

// Инициализация экземпляра i18n с использованием react-i18next и импортированных настроек
i18nForUI.use(initReactI18next).init(initOptions)

// Экспорт настроенного экземпляра i18n
export default i18nForUI