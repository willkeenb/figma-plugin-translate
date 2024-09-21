import type { Options } from '@/types/common'

export const INTEGRATION_TOKEN = 'secret_WNj2iszw5vY5n2Omxl2R6tfZkpvRfYixoke7haZpc7G'
export const PROXY_URL = 'https://reverse-proxy.willkeenbe.workers.dev'
export const KEY_PROPERTY_NAME = 'key'
export const SETTINGS_KEY = 'sync-notion'
export const CACHE_KEY = 'sync-notion-cache'
export const GROUP_ID_KEY = 'sync-notion-group-id'

export const DATABASE_OPTIONS = [
  { id: '103cfaf4c56d80ad9b4bcfec1685a2db', labelKey: 'Мобилка' },
  { id: '104cfaf4c56d8088a4caec974ae2a8df', labelKey: 'Сервисы' },
] as const;

export const VALUE_PROPERTY_OPTIONS = [
  { value: 'ru', labelKey: 'Русский' },
  { value: 'uz', labelKey: 'Узбекский' },
] as const;

export type DatabaseOptionId = typeof DATABASE_OPTIONS[number]['id'] | '';
export type ValuePropertyName = typeof VALUE_PROPERTY_OPTIONS[number]['value'] | '';

export const DEFAULT_WIDTH = 400

export const DEFAULT_OPTIONS: Options = {
  // fetch
  selectedTabKey: 'list',
  selectedDatabaseId: DATABASE_OPTIONS[0]['id'],
  valuePropertyName: VALUE_PROPERTY_OPTIONS[0]['value'],
  // list
  filterString: '',
  sortValue: 'created_time',
  sortOrder: 'descending',
  selectedRowId: null,
  scrollPosition: 0,
  // utilities
  targetTextRange: 'selection',
  includeComponents: true,
  includeInstances: false,
  // settings
  // settings
  pluginLanguage: 'en',
}