/** @jsx h */
/** @jsxFrag Fragment */
import { JSX } from 'preact'
import { useEffect, useState } from 'preact/hooks'

import { Tabs, type TabsOption } from '@create-figma-plugin/ui'
import { emit, on } from '@create-figma-plugin/utilities'
import { useTranslation } from 'preact-i18next'
import { useMount, useUnmount, useUpdateEffect } from 'react-use'

import { useStore } from '@/ui/Store'
import useCache from '@/ui/hooks/useCache'
import useOptions from '@/ui/hooks/useOptions'
import useResizeWindow from '@/ui/hooks/useResizeWindow'
import Fetch from '@/ui/tabs/Fetch'
import List from '@/ui/tabs/List'
import Settings from '@/ui/tabs/Settings'
import Utilities from '@/ui/tabs/Utilities'

import type { SelectedTabKey, SelectedTabValue } from '@/types/common'
import type { ChangeLanguageHandler, NotifyHandler } from '@/types/eventHandler'

function setupEventHandlers() {
  on<NotifyHandler>('NOTIFY', ({ message, options }) => {
    emit<NotifyHandler>('NOTIFY', { message, options })
  })
}

export default function App() {
  const { t, i18n } = useTranslation()
  const options = useStore()
  const {
    updateOptions,
    loadOptionsFromClientStorage,
    saveOptionsToClientStorage,
  } = useOptions()
  const { resizeWindow } = useResizeWindow()
  const { loadCacheFromDocument } = useCache()
  const [mounted, setMounted] = useState(false)
  const [selectedTabValue, setSelectedTabValue] =
    useState<SelectedTabValue>('List')

  // Определение опций для вкладок
  const tabOptions: TabsOption[] &
    {
      value: SelectedTabValue
    }[] = [
    {
      children: <List />,
      value: t('Tabs.list'),
    },
    {
      children: <Utilities />,
      value: t('Tabs.utilities'),
    },
    {
      children: <Fetch />,
      value: t('Tabs.fetch'),
    },
    {
      children: <Settings />,
      value: t('Tabs.settings'),
    },
  ]

  // Обработчик изменения вкладки
  function handleTabChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newTabValue = event.currentTarget.value as SelectedTabValue
    let newTabKey: SelectedTabKey = 'list'

    if (newTabValue === t('Tabs.fetch')) {
      newTabKey = 'fetch'
    } else if (newTabValue === t('Tabs.list')) {
      newTabKey = 'list'
    } else if (newTabValue === t('Tabs.utilities')) {
      newTabKey = 'utilities'
    } else if (newTabValue === t('Tabs.settings')) {
      newTabKey = 'settings'
    }

    updateOptions({
      selectedTabKey: newTabKey,
    })
  }

  // Эффект при монтировании компонента
  useEffect(() => {
    const initializeApp = async () => {
      console.log('App mounted start')

      // Загрузка настроек из clientStorage
      await loadOptionsFromClientStorage()

      // Загрузка кэша keyValues из документа
      await loadCacheFromDocument()

      // Завершение монтирования
      console.log('App mounted done')
      setMounted(true)

      resizeWindow()
    }

    initializeApp()
  }, [])

  // Эффект при размонтировании компонента
  useUnmount(() => {
    console.log('App unmounted')
  })

  // Эффект при обновлении настроек
  useUpdateEffect(() => {
    saveOptionsToClientStorage(options)
  }, [options])

  // Эффект при обновлении выбранной вкладки
  useUpdateEffect(() => {
    const translatedTabValue = t(`Tabs.${options.selectedTabKey}` as const)
    setSelectedTabValue(translatedTabValue as SelectedTabValue)
  }, [options.selectedTabKey])

  // Эффект при изменении языка плагина
  useUpdateEffect(() => {
    console.log('pluginLanguage update on App', options.pluginLanguage)

    // Смена языка UI
    i18n.changeLanguage(options.pluginLanguage).catch(error => {
      console.error('Ошибка при смене языка:', error)
    })

    // Смена языка в основной части плагина
    emit<ChangeLanguageHandler>('CHANGE_LANGUAGE', options.pluginLanguage)

    // Обновление значения выбранной вкладки в соответствии с новым языком
    const translatedTabValue = t(`Tabs.${options.selectedTabKey}` as const)
    setSelectedTabValue(translatedTabValue as SelectedTabValue)
  }, [options.pluginLanguage])

  if (!mounted) {
    return null
  }

  return (
    <div id="wrapper">
      <Tabs
        options={tabOptions}
        onChange={handleTabChange}
        value={selectedTabValue}
      />
    </div>
  )
}