import { type JSX, h } from 'preact'
import { useRef, useState, useCallback, useMemo } from 'preact/hooks'

import {
  Button,
  Container,
  Dropdown,
  DropdownOption,
  Stack,
  Textbox,
  VerticalSpace,
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { useTranslation } from 'react-i18next'
import { useMount, useUnmount } from 'react-use'

import { DATABASE_OPTIONS } from '@/constants'
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

  const databaseDropdownOptions = useMemo<DropdownOption[]>(() => 
    DATABASE_OPTIONS.map(option => ({
      text: t(option.labelKey),
      value: option.id
    }))
  , [t])

  const handleInput = useCallback((key: keyof Options) => {
    return (event: JSX.TargetedEvent<HTMLInputElement>) => {
      updateOptions({
        [key]: event.currentTarget.value,
      })
    }
  }, [updateOptions])

  const handleDatabaseChange = useCallback((event: JSX.TargetedEvent<HTMLInputElement>) => {
    const newDatabaseId = event.currentTarget.value as DatabaseOptionId
    console.log('New database selected:', newDatabaseId)
    updateOptions({ selectedDatabaseId: newDatabaseId })
  }, [updateOptions])

  const handleFetchClick = useCallback(async () => {
    setFetching(true)

    emit<NotifyHandler>('NOTIFY', {
      message: t('notifications.Fetch.loading'),
    })

    keyValuesRef.current = []

    try {
      await fetchNotion({
        proxyUrl: 'https://reverse-proxy.willkeenbe.workers.dev',
        integrationToken: options.integrationToken,
        selectedDatabaseId: options.selectedDatabaseId,
        keyPropertyName: options.keyPropertyName,
        valuePropertyName: options.valuePropertyName,
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
  }, [fetchNotion, options, saveCacheToDocument, t])

  const handleClearClick = useCallback(() => {
    console.log('handleClearClick')
    useKeyValuesStore.setState({ keyValues: [] })
    saveCacheToDocument([])
    emit<NotifyHandler>('NOTIFY', {
      message: t('notifications.Fetch.clearCache'),
    })
  }, [saveCacheToDocument, t])

  useMount(() => {
    console.log('Fetch mounted')
    resizeWindow()
  })

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
          <div>{t('Fetch.integrationToken')}</div>
          <Textbox
            variant="border"
            onInput={handleInput('integrationToken')}
            value={options.integrationToken}
            disabled={fetching}
          />
        </div>

        <div className="flex flex-col gap-1">
          <div>{t('Fetch.keyPropertyName')}</div>
          <Textbox
            variant="border"
            onInput={handleInput('keyPropertyName')}
            value={options.keyPropertyName}
            disabled={fetching}
          />
        </div>

        <div className="flex flex-col gap-1">
          <div>{t('Fetch.valuePropertyName')}</div>
          <Textbox
            variant="border"
            onInput={handleInput('valuePropertyName')}
            value={options.valuePropertyName}
            disabled={fetching}
          />
        </div>
      </Stack>

      <VerticalSpace space="large" />

      <Stack space="small">
        <div className="flex flex-col gap-1">
          <Button
            fullWidth
            onClick={handleFetchClick}
            disabled={
              !options.selectedDatabaseId ||
              !options.integrationToken ||
              !options.keyPropertyName ||
              !options.valuePropertyName ||
              fetching
            }
            loading={fetching}
          >
            {t('Fetch.fetchButton.label')}
          </Button>
          <p className="text-secondary">{t('Fetch.fetchButton.description')}</p>
        </div>

        <Button
          danger
          secondary
          fullWidth
          onClick={handleClearClick}
          disabled={keyValues.length === 0}
        >
          {t('Fetch.clearCacheButton', { length: keyValues.length })}
        </Button>
      </Stack>

      <VerticalSpace space="medium" />
    </Container>
  )
}