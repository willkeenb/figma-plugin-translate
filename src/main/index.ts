import {
  emit,
  loadSettingsAsync,
  on,
  saveSettingsAsync,
  setRelaunchButton,
  showUI,
} from '@create-figma-plugin/utilities'

import {
  CACHE_KEY,
  DEFAULT_OPTIONS,
  DEFAULT_WIDTH,
  SETTINGS_KEY,
} from '@/constants'
import i18n from '@/i18n/main'
import applyKeyValue from '@/main/applyKeyValue'
import applyValue from '@/main/applyValue'
import highlightText from '@/main/highlightText'
import renameLayer from '@/main/renameLayer'

import type { NotionKeyValue, Options } from '@/types/common'
import type {
  ApplyKeyValueHandler,
  ApplyValueHandler,
  ChangeLanguageHandler,
  HighlightTextHandler,
  LoadCacheFromMainHandler,
  LoadCacheFromUIHandler,
  LoadOptionsFromMainHandler,
  LoadOptionsFromUIHandler,
  NotifyHandler,
  RenameLayerHandler,
  ResizeWindowHandler,
  SaveCacheHandler,
  SaveOptionsHandler,
} from '@/types/eventHandler'

export default async function () {
  // Устанавливаем кнопку перезапуска
  setRelaunchButton(figma.root, 'open')

  // Показываем пользовательский интерфейс
  showUI({
    width: DEFAULT_WIDTH,
    height: 0,
  })

  // Регистрируем обработчики событий

  // Загрузка настроек из UI
  on<LoadOptionsFromUIHandler>('LOAD_OPTIONS_FROM_UI', async () => {
    const options = await loadSettingsAsync<Options>(
      DEFAULT_OPTIONS,
      SETTINGS_KEY,
    )

    // Меняем язык на стороне main
    await i18n.changeLanguage(options.pluginLanguage)
    console.log('language in main updated.', options.pluginLanguage, i18n)

    // Отправляем настройки в UI
    emit<LoadOptionsFromMainHandler>('LOAD_OPTIONS_FROM_MAIN', options)
  })

  // Сохранение настроек
  on<SaveOptionsHandler>('SAVE_OPTIONS', async options => {
    await saveSettingsAsync<Options>(options, SETTINGS_KEY)
  })

  // Отображение уведомлений
  on<NotifyHandler>('NOTIFY', options => {
    figma.notify(options.message, options.options)
  })

  // Изменение размера окна
  on<ResizeWindowHandler>('RESIZE_WINDOW', windowSize => {
    figma.ui.resize(windowSize.width, windowSize.height)
  })

  // Загрузка кэша из UI
  on<LoadCacheFromUIHandler>('LOAD_CACHE_FROM_UI', async () => {
    let cache: NotionKeyValue[]

    // Получаем данные кэша из Document
    const data = figma.root.getPluginData(CACHE_KEY)

    // Если данные есть, парсим их, иначе возвращаем пустой массив
    if (data) {
      cache = JSON.parse(data)
    } else {
      cache = []
    }

    // Отправляем кэш в UI
    emit<LoadCacheFromMainHandler>('LOAD_CACHE_FROM_MAIN', cache)
  })

  // Сохранение кэша
  on<SaveCacheHandler>('SAVE_CACHE', keyValues => {
    // Сначала удаляем существующий кэш
    figma.root.setPluginData(CACHE_KEY, '')

    // Сохраняем кэш в Document
    figma.root.setPluginData(CACHE_KEY, JSON.stringify(keyValues))

    console.log('save cache success', keyValues)
  })

  // Применение ключ-значение
  on<ApplyKeyValueHandler>('APPLY_KEY_VALUE', keyValue => {
    applyKeyValue(keyValue)
  })

  // Применение значения
  on<ApplyValueHandler>('APPLY_VALUE', (keyValues, options) => {
    applyValue(keyValues, options)
  })

  // Переименование слоя
  on<RenameLayerHandler>('RENAME_LAYER', (keyValues, options) => {
    renameLayer(keyValues, options)
  })

  // Подсветка текста
  on<HighlightTextHandler>('HIGHLIGHT_TEXT', (keyValues, options) => {
    highlightText(keyValues, options)
  })

  // Изменение языка
  on<ChangeLanguageHandler>('CHANGE_LANGUAGE', async (language, options) => {
    // Меняем язык на стороне main
    await i18n.changeLanguage(language)
    console.log('language in main updated.', language, i18n)

    // Если options.notify true, отображаем уведомление о завершении
    if (options?.notify) {
      figma.notify(i18n.t('notifications.Settings.updateLanguage'))
    }
  })
}