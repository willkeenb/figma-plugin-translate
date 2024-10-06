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
  setRelaunchButton(figma.root, 'open')

  showUI({
    width: DEFAULT_WIDTH,
    height: 0,
  })

  on<LoadOptionsFromUIHandler>('LOAD_OPTIONS_FROM_UI', async () => {
    const options = await loadSettingsAsync<Options>(
      DEFAULT_OPTIONS,
      SETTINGS_KEY,
    )

    await i18n.changeLanguage(options.pluginLanguage)
    console.log('language in main updated.', options.pluginLanguage, i18n)

    emit<LoadOptionsFromMainHandler>('LOAD_OPTIONS_FROM_MAIN', options)
  })

  on<SaveOptionsHandler>('SAVE_OPTIONS', async options => {
    await saveSettingsAsync<Options>(options, SETTINGS_KEY)
  })

  on<NotifyHandler>('NOTIFY', options => {
    figma.notify(options.message, options.options)
  })

  on<ResizeWindowHandler>('RESIZE_WINDOW', windowSize => {
    figma.ui.resize(windowSize.width, windowSize.height)
  })

  on<LoadCacheFromUIHandler>('LOAD_CACHE_FROM_UI', async () => {
    let cache: NotionKeyValue[]

    const data = figma.root.getPluginData(CACHE_KEY)

    if (data) {
      cache = JSON.parse(data)
    } else {
      cache = []
    }

    emit<LoadCacheFromMainHandler>('LOAD_CACHE_FROM_MAIN', cache)
  })

  on<SaveCacheHandler>('SAVE_CACHE', keyValues => {
    figma.root.setPluginData(CACHE_KEY, '')
    figma.root.setPluginData(CACHE_KEY, JSON.stringify(keyValues))
    console.log('save cache success', keyValues)
  })

  on<ApplyKeyValueHandler>('APPLY_KEY_VALUE', keyValue => {
    console.log('Applying key-value:', keyValue)
    applyKeyValue(keyValue)
  })

  on<ApplyValueHandler>('APPLY_VALUE', (keyValues, options) => {
    applyValue(keyValues, options)
  })

  on<RenameLayerHandler>('RENAME_LAYER', (keyValues, options) => {
    renameLayer(keyValues, options)
  })

  on<HighlightTextHandler>('HIGHLIGHT_TEXT', (keyValues, options) => {
    highlightText(keyValues, options)
  })

  on<ChangeLanguageHandler>('CHANGE_LANGUAGE', async (language, options) => {
    await i18n.changeLanguage(language)
    console.log('language in main updated.', language, i18n)

    if (options?.notify) {
      figma.notify(i18n.t('notifications.Settings.updateLanguage'))
    }
  })
}