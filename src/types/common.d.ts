// Импорт типов из файла database
import type { DatabaseOptionId, ValuePropertyName } from './database'

// Определение возможных ключей вкладок
export type SelectedTabKey = 'fetch' | 'list' | 'utilities' | 'settings'

// Определение возможных значений вкладок
export type SelectedTabValue = 'Fetch' | 'List' | 'Utilities' | 'Settings'

// Типы для сортировки
export type SortValue = 'key' | 'valueRu' | 'valueUz' | 'created_time' | 'last_edited_time';
export type SortOrder = 'ascending' | 'descending'

// Диапазон текста для операций
export type TargetTextRange = 'selection' | 'currentPage' | 'allPages'

// Поддерживаемые языки плагина
export type PluginLanguage = 'en' | 'ja' | 'ru'

// Основные настройки плагина
export type Options = {
  [x: string]: any
  options: any
  options: any
  // Настройки для вкладки fetch
  selectedTabKey: SelectedTabKey
  selectedDatabaseId: DatabaseOptionId
  valuePropertyName: ValuePropertyName
  // Настройки для вкладки list
  filterString: string
  sortValue: SortValue
  sortOrder: SortOrder
  selectedRowId: string | null
  scrollPosition: number
  // Настройки для вкладки utilities
  targetTextRange: TargetTextRange
  includeComponents: boolean
  includeInstances: boolean
  // Настройки для вкладки settings
  pluginLanguage: PluginLanguage
}

// Типы для работы с данными Notion
export type NotionTitle = {
  type: 'title'
  title: { plain_text: string }[]
}

export type NotionFomula = {
  type: 'formula'
  formula: {
    string: string
  }
}

export type NotionRichText = {
  type: 'rich_text'
  rich_text: { plain_text: string }[]
}

export type NotionPage = {
  object: 'page'
  id: string
  properties: {
    [key: string]: NotionTitle | NotionFomula | NotionRichText
  }
  created_time: string
  last_edited_time: string
  url: string
}

export type NotionKeyValue = {
  id: string
  key: string
  valueRu: string
  valueUz: string
  created_time: string
  last_edited_time: string
  url: string
}

// Реэкспорт типа из файла database
export type { DatabaseOptionId }