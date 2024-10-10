// figma.notify('Plugin started');


// if (figma.currentUser) {
//   figma.notify(`Current user: ${figma.currentUser.name}`);
// } else {
//   figma.notify('No current user found');
// }

import {
  emit,
  loadSettingsAsync,
  on,
  once,
  saveSettingsAsync,
  setRelaunchButton,
  showUI,
} from '@create-figma-plugin/utilities'

import {
  CACHE_KEY,
  DEFAULT_HEIGHT,
  DEFAULT_OPTIONS,
  DEFAULT_WIDTH,
  SETTINGS_KEY,
} from '@/constants'
import i18n from '@/i18n/main'
import applyKeyValue from '@/main/applyKeyValue'
import applyValue from '@/main/applyValue'
import highlightText from '@/main/highlightText'
import renameLayer from '@/main/renameLayer'
import { syncWithNotion } from './notionApi'

import type { NotionKeyValue, Options } from '@/types/common'
import type {
  LoadOptionsFromUIHandler,
  LoadOptionsFromMainHandler,
  SaveOptionsHandler,
  NotifyHandler,
  ResizeWindowHandler,
  LoadCacheFromUIHandler,
  LoadCacheFromMainHandler,
  SaveCacheHandler,
  ApplyKeyValueHandler,
  ApplyValueHandler,
  UpdateKeyValueHandler,
  RenameLayerHandler,
  HighlightTextHandler,
  ChangeLanguageHandler,
  SyncWithNotionHandler,
} from '@/types/eventHandler'


export default async function () {
  figma.root.setRelaunchData({ open: 'Открыть Text Sync' })

  showUI({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT })


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

  on<NotifyHandler>('NOTIFY', ({ message, options }) => {
    if (options?.timeout) {
      figma.notify(message, { ...options, timeout: options.timeout })
    } else {
      figma.notify(message, options)
    }
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

  on<UpdateKeyValueHandler>('UPDATE_KEY_VALUE', async (updatedKeyValue) => {
    // Здесь должна быть логика обновления значения в вашем хранилище данных
    // Например, обновление в Notion или в локальном кэше
    console.log('Updating key-value:', updatedKeyValue)
    // После успешного обновления, возможно, вы захотите обновить состояние в UI
    // emit<RefreshUIHandler>('REFRESH_UI')
  })

  on<RenameLayerHandler>('RENAME_LAYER', (keyValues, options) => {
    renameLayer(keyValues, options)
  })

  on<SyncWithNotionHandler>('SYNC_WITH_NOTION', async (updatedFields, id, originalKeyValue) => {
    console.log('SYNC_WITH_NOTION event received', { updatedFields, id, originalKeyValue });
    try {
      const userName = figma.currentUser ? figma.currentUser.name : 'Unknown User'
      console.log('Current Figma user:', userName);
      const result = await syncWithNotion(updatedFields, id, originalKeyValue, userName)
      console.log('Sync with Notion result:', result);
      emit<NotifyHandler>('NOTIFY', {
        message: 'Changes synced with Notion and comment added',
        options: { timeout: 3000 }
      })
    } catch (error) {
      console.error('Error syncing with Notion:', error)
      emit<NotifyHandler>('NOTIFY', {
        message: `Error syncing with Notion: ${error instanceof Error ? error.message : 'Unknown error'}`,
        options: { error: true, timeout: 5000 }
      })
    }
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
  // Добавим обработчик для кнопки перезапуска
  // figma.on('run', ({ command }) => {
  //   if (command === 'open') {
  //     console.log('Плагин был перезапущен')
  //     // Здесь можно добавить дополнительную логику при перезапуске
  //   }
  // })
}