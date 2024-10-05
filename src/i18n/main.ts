import i18n from 'i18next'

import { initOptions } from '@/i18n'

// Создание отдельного экземпляра i18n для основной части приложения
const i18nForMain = i18n.createInstance()

// Инициализация экземпляра i18n с использованием импортированных настроек
i18nForMain.init(initOptions)

// Экспорт настроенного экземпляра i18n
export default i18nForMain