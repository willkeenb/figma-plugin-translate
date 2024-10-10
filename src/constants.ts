import type { Options } from '@/types/common'

// Токен интеграции для доступа к API Notion
export const INTEGRATION_TOKEN = 'secret_WNj2iszw5vY5n2Omxl2R6tfZkpvRfYixoke7haZpc7G'

// URL прокси-сервера для обхода CORS-ограничений
export const PROXY_URL = 'https://reverse-proxy.willkeenbe.workers.dev'

// Имя свойства, используемого в качестве ключа
export const KEY_PROPERTY_NAME = 'key'

// Ключ для хранения настроек плагина
export const SETTINGS_KEY = 'sync-notion'

// Ключ для хранения кэша плагина
export const CACHE_KEY = 'sync-notion-cache'

// Ключ для хранения ID группы, созданной плагином
export const GROUP_ID_KEY = 'sync-notion-group-id'

// Опции баз данных Notion
export const DATABASE_OPTIONS = [
  { id: '103cfaf4c56d80ad9b4bcfec1685a2db', labelKey: 'Мобилка' },
  { id: '114cfaf4c56d8018b553fe2f46f77186', labelKey: 'Переводы' },
] as const;

// Опции свойств значений
export const VALUE_PROPERTY_OPTIONS = [
  { value: 'valueRu', labelKey: 'Русский' },
  { value: 'valueUz', labelKey: 'Узбекский' },
] as const;

// Тип для имени свойства значения
export type ValuePropertyName = typeof VALUE_PROPERTY_OPTIONS[number]['value'] | 'ru' | 'uz' | '';

// Типы для ID базы данных и имени свойства значения
export type DatabaseOptionId = typeof DATABASE_OPTIONS[number]['id'] | '';

// Стандартная ширина интерфейса плагина
export const DEFAULT_WIDTH = 400

// Настройки по умолчанию
export const DEFAULT_OPTIONS: Options = {
  // Настройки выборки данных
  selectedTabKey: 'list',
  selectedDatabaseId: DATABASE_OPTIONS[0]['id'],
  valuePropertyName: VALUE_PROPERTY_OPTIONS[0]['value'],
  // Настройки списка
  filterString: '',
  sortValue: 'created_time',
  sortOrder: 'descending',
  selectedRowId: null,
  scrollPosition: 0,
  // Настройки утилит
  targetTextRange: 'selection',
  includeComponents: true,
  includeInstances: false,
  // Настройки плагина
  pluginLanguage: 'en'
}