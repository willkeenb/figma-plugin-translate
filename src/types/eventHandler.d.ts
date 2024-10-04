import type {
  NotionKeyValue,
  Options,
  PluginLanguage,
  TargetTextRange,
} from '@/types/common'
import type { EventHandler } from '@create-figma-plugin/utilities'

// Интерфейсы для обработчиков событий

// Загрузка настроек из UI
interface LoadOptionsFromUIHandler extends EventHandler {
  name: 'LOAD_OPTIONS_FROM_UI'
  handler: () => void
}

// Загрузка настроек из основной части плагина
interface LoadOptionsFromMainHandler extends EventHandler {
  name: 'LOAD_OPTIONS_FROM_MAIN'
  handler: (options: Options) => void
}

// Сохранение настроек
interface SaveOptionsHandler extends EventHandler {
  name: 'SAVE_OPTIONS'
  handler: (options: Options) => void
}

// Отправка уведомлений
interface NotifyHandler extends EventHandler {
  name: 'NOTIFY'
  handler: (options: { message: string; options?: NotificationOptions }) => void
}

// Изменение размера окна плагина
interface ResizeWindowHandler extends EventHandler {
  name: 'RESIZE_WINDOW'
  handler: (windowSize: { width: number; height: number }) => void
}

// Загрузка кэша из UI
interface LoadCacheFromUIHandler extends EventHandler {
  name: 'LOAD_CACHE_FROM_UI'
  handler: () => void
}

// Загрузка кэша из основной части плагина
interface LoadCacheFromMainHandler extends EventHandler {
  name: 'LOAD_CACHE_FROM_MAIN'
  handler: (keyValues: NotionKeyValue[]) => void
}

// Сохранение кэша
interface SaveCacheHandler extends EventHandler {
  name: 'SAVE_CACHE'
  handler: (keyValues: NotionKeyValue[]) => void
}

// Применение пары ключ-значение
interface ApplyKeyValueHandler extends EventHandler {
  name: 'APPLY_KEY_VALUE'
  handler: (keyValue: NotionKeyValue) => void
}

// Применение значения
interface ApplyValueHandler extends EventHandler {
  name: 'APPLY_VALUE'
  handler: (
    keyValues: NotionKeyValue[],
    options: {
      targetTextRange: TargetTextRange
      includeComponents: boolean
      includeInstances: boolean
    },
  ) => void
}

// Переименование слоя
interface RenameLayerHandler extends EventHandler {
  name: 'RENAME_LAYER'
  handler: (
    keyValues: NotionKeyValue[],
    options: {
      targetTextRange: TargetTextRange
      includeComponents: boolean
      includeInstances: boolean
    },
  ) => void
}

// Подсветка текста
interface HighlightTextHandler extends EventHandler {
  name: 'HIGHLIGHT_TEXT'
  handler: (
    keyValues: NotionKeyValue[],
    options: {
      targetTextRange: TargetTextRange
      includeComponents: boolean
      includeInstances: boolean
    },
  ) => void
}

// Изменение языка плагина
interface ChangeLanguageHandler extends EventHandler {
  name: 'CHANGE_LANGUAGE'
  handler: (language: PluginLanguage, options?: { notify?: boolean }) => void
}