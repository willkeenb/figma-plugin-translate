/** @jsx h */
import { type JSX, h } from 'preact'
import { useRef, useState, useCallback, useMemo, useEffect } from 'preact/hooks'

import {
  Button,
  Container,
  Dropdown,
  DropdownOption,
  Stack,
  VerticalSpace,
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { useTranslation } from 'react-i18next'
import { useMount, useUnmount } from 'react-use'

import { INTEGRATION_TOKEN, KEY_PROPERTY_NAME, DATABASE_OPTIONS, VALUE_PROPERTY_OPTIONS } from '@/constants'
import { ValuePropertyName } from '@/constants'
import { useKeyValuesStore, useStore } from '@/ui/Store'
import useCache from '@/ui/hooks/useCache'
import useNotion from '@/ui/hooks/useNotion'
import useOptions from '@/ui/hooks/useOptions'
import useResizeWindow from '@/ui/hooks/useResizeWindow'

import type { NotionKeyValue, Options } from '@/types/common'
import type { DatabaseOptionId } from '@/types/database'
import type { NotifyHandler } from '@/types/eventHandler'

export default function Fetch() {
  const { t } = useTranslation()
  const options = useStore()
  const { keyValues } = useKeyValuesStore()
  const { updateOptions } = useOptions()
  const { resizeWindow } = useResizeWindow()
  const { fetchNotion } = useNotion()
  const { saveCacheToDocument } = useCache()
  const [fetching, setFetching] = useState(false)
  const keyValuesRef = useRef<NotionKeyValue[]>([])

  // Создание опций для выпадающего списка баз данных
  const databaseDropdownOptions = useMemo<DropdownOption[]>(() => 
    DATABASE_OPTIONS.map(option => ({
      text: t(option.labelKey),
      value: option.id
    }))
  , [t])

  // Создание опций для выпадающего списка свойств значений
  const valuePropertyOptions = useMemo<DropdownOption[]>(() => 
    VALUE_PROPERTY_OPTIONS.map(option => ({
      text: t(option.labelKey),
      value: option.value
    }))
  , [t])

  // Обработчик изменения свойства значения
  const handleValuePropertyChange = useCallback((event: JSX.TargetedEvent<HTMLInputElement>) => {
    const newValue = event.currentTarget.value as ValuePropertyName
    updateOptions({ valuePropertyName: newValue })
  }, [updateOptions])

  // Обработчик изменения ввода
  const handleInput = useCallback((key: keyof Options) => {
    return (event: JSX.TargetedEvent<HTMLInputElement>) => {
      updateOptions({
        [key]: event.currentTarget.value,
      })
    }
  }, [updateOptions])

  // Обработчик изменения базы данных
  const handleDatabaseChange = useCallback((event: JSX.TargetedEvent<HTMLInputElement>) => {
    const newDatabaseId = event.currentTarget.value as DatabaseOptionId
    console.log('New database selected:', newDatabaseId)
    updateOptions({ selectedDatabaseId: newDatabaseId })
  }, [updateOptions])

  // Обработчик нажатия кнопки "Fetch"
  const handleFetchClick = useCallback(async () => {
    setFetching(true)

    emit<NotifyHandler>('NOTIFY', {
      message: t('notifications.Fetch.loading'),
    })

    keyValuesRef.current = []

    try {
      await fetchNotion({
        integrationToken: INTEGRATION_TOKEN,
        selectedDatabaseId: options.selectedDatabaseId,
        keyPropertyName: KEY_PROPERTY_NAME,
        valuePropertyNameRu: 'ru',
        valuePropertyNameUz: 'uz',
        keyValuesArray: keyValuesRef.current,
      })

      console.log('fetch done', keyValuesRef.current)

      useKeyValuesStore.setState({ keyValues: keyValuesRef.current })
      saveCacheToDocument(keyValuesRef.current)

      emit<NotifyHandler>('NOTIFY', {
        message: t('notifications.Fetch.finish'),
      })
    } catch (error: unknown) {
      console.error('Fetch error:', error)
      let errorMessage: string

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else {
        errorMessage = t('notifications.Fetch.error.unknown')
      }

      emit<NotifyHandler>('NOTIFY', {
        message: errorMessage,
        options: {
          error: true,
        },
      })
    } finally {
      setFetching(false)
    }
  }, [options.selectedDatabaseId, options.valuePropertyName, fetchNotion, saveCacheToDocument, t])

  // Обработчик нажатия кнопки "Clear"
  const handleClearClick = useCallback(() => {
    console.log('handleClearClick')
    useKeyValuesStore.setState({ keyValues: [] })
    saveCacheToDocument([])
    emit<NotifyHandler>('NOTIFY', {
      message: t('notifications.Fetch.clearCache'),
    })
  }, [saveCacheToDocument, t])

  // Эффект при монтировании компонента
  useMount(() => {
    console.log('Fetch mounted')
    resizeWindow()
  })

  // Эффект при размонтировании компонента
  useUnmount(() => {
    console.log('Fetch unmounted')
  })

  return (
    <Container space="medium">
      <VerticalSpace space="medium" />

      <Stack space="small">
        <div className="flex flex-col gap-1">
          <div>{t('Fetch.databaseId')}</div>
          <Dropdown
            options={databaseDropdownOptions}
            value={options.selectedDatabaseId}
            onChange={handleDatabaseChange}
            disabled={fetching}
            variant='border'
          />
        </div>

        <div className="flex flex-col gap-1">
          <div>{t('Fetch.valuePropertyName')}</div>
          <Dropdown
            options={valuePropertyOptions}
            value={options.valuePropertyName}
            onChange={handleValuePropertyChange}
            disabled={fetching}
            variant='border'
          />
        </div>
      </Stack>

      <VerticalSpace space="large" />

      <Stack space="small">
        <div className="flex flex-col gap-1">
        <p className="text-secondary">{t('Fetch.fetchButton.description')}</p>
        <VerticalSpace space="small" />
          <Button
            fullWidth
            onClick={handleFetchClick}
            disabled={!options.selectedDatabaseId || !options.valuePropertyName || fetching}
            loading={fetching}
          >
            {t('Fetch.fetchButton.label')}
          </Button>
        </div>
      </Stack>
      <VerticalSpace space="medium" />
    </Container>
  )
}