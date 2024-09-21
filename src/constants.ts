import type { Options } from '@/types/common'

export const SETTINGS_KEY = 'sync-notion'
export const CACHE_KEY = 'sync-notion-cache'
export const GROUP_ID_KEY = 'sync-notion-group-id'

export const DATABASE_OPTIONS = [
  { id: '103cfaf4c56d80ad9b4bcfec1685a2db', labelKey: 'Мобилка' },
  { id: '104cfaf4c56d8088a4caec974ae2a8df', labelKey: 'Сервисы' },
] as const;

export type DatabaseOptionId = typeof DATABASE_OPTIONS[number]['id'] | '';

export const DEFAULT_WIDTH = 400

export const DEFAULT_OPTIONS: Options = {
  // fetch
  selectedTabKey: 'fetch',
  proxyUrl: '',
  integrationToken: '',
  selectedDatabaseId: DATABASE_OPTIONS[0]['id'],
  keyPropertyName: '',
  valuePropertyName: '',
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
  pluginLanguage: 'en',
}