/** @jsx h */
import { Fragment, type JSX, h } from 'preact'
import { useState, useCallback, useMemo, useEffect } from 'preact/hooks'
import {
  Divider,
  Dropdown,
  type DropdownOption,
  Textbox,
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { useTranslation } from 'react-i18next'
import { useDebounce, useMount, useUnmount } from 'react-use'

import { INTEGRATION_TOKEN, KEY_PROPERTY_NAME, DATABASE_OPTIONS } from '@/constants'
import type { DatabaseOptionId } from '@/constants'
import { useKeyValuesStore, useStore } from '@/ui/Store'
import useNotion from '@/ui/hooks/useNotion'
import useCache from '@/ui/hooks/useCache'
import useOptions from '@/ui/hooks/useOptions'
import useResizeWindow from '@/ui/hooks/useResizeWindow'
import type { NotionKeyValue, SortOrder, SortValue } from '@/types/common'
import KeyValueList from '@/ui/components/KeyValueList'

export default function List() {
  const { t } = useTranslation()
  const options = useStore()
  const { keyValues } = useKeyValuesStore()
  const { updateOptions } = useOptions()
  const { resizeWindow } = useResizeWindow()
  const [fetching, setFetching] = useState(false)
  const [filteredRows, setFilteredRows] = useState<NotionKeyValue[]>([])
  const [isSortVisible, setIsSortVisible] = useState(false)

  useEffect(() => {
    setFilteredRows(keyValues)
  }, [keyValues])
  const sortValueOptions: DropdownOption[] & {
    value?: SortValue
  }[] = [
      { text: t('List.sortValue.key'), value: 'key' },
      { text: t('List.sortValue.valueRu'), value: 'valueRu' },
      { text: t('List.sortValue.valueUz'), value: 'valueUz' },
      { text: t('List.sortValue.created_time'), value: 'created_time' },
      { text: t('List.sortValue.last_edited_time'), value: 'last_edited_time' },
    ]

  const sortOrderOptions: DropdownOption[] & {
    value?: SortOrder
  }[] = [
      { text: t('List.sortOrder.ascending'), value: 'ascending' },
      { text: t('List.sortOrder.descending'), value: 'descending' },
    ]

  const databaseOptions = useMemo(() =>
    DATABASE_OPTIONS.map(option => ({
      text: t(option.labelKey),
      value: option.id
    }))
    , [t])

  const { fetchNotion } = useNotion()
  const { saveCacheToDocument } = useCache()

  const handleFetchClick = useCallback(async () => {
    if (!options.selectedDatabaseId) {
      return;
    }

    setFetching(true)
    emit('NOTIFY', {
      message: t('notifications.Fetch.loading'),
    })

    const tempKeyValues: NotionKeyValue[] = []

    try {
      await fetchNotion({
        integrationToken: INTEGRATION_TOKEN,
        selectedDatabaseId: options.selectedDatabaseId,
        keyPropertyName: KEY_PROPERTY_NAME,
        valuePropertyNameRu: 'ru',
        valuePropertyNameUz: 'uz',
        keyValuesArray: tempKeyValues,
      })

      console.log('fetch done', tempKeyValues)

      useKeyValuesStore.setState({ keyValues: tempKeyValues })
      saveCacheToDocument(tempKeyValues)
      setFilteredRows(tempKeyValues)

      emit('NOTIFY', {
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

      emit('NOTIFY', {
        message: errorMessage,
        options: {
          error: true,
        },
      })
    } finally {
      setFetching(false)
    }
  }, [options.selectedDatabaseId, fetchNotion, saveCacheToDocument, t])

  const filterAndSortList = useCallback(() => {
    let result = [...keyValues]

    if (options.filterString) {
      result = result.filter(row => {
        const keyProperty = row.key.toLowerCase()
        const valueRuProperty = row.valueRu.toLowerCase()
        const valueUzProperty = row.valueUz.toLowerCase()
        const filterLower = options.filterString.toLowerCase()
        return (
          keyProperty.includes(filterLower) ||
          valueRuProperty.includes(filterLower) ||
          valueUzProperty.includes(filterLower)
        )
      })
    }

    result.sort((a, b) => {
      let comparison: number
      if (options.sortValue === 'created_time' || options.sortValue === 'last_edited_time') {
        const aDate = new Date(a[options.sortValue]).getTime()
        const bDate = new Date(b[options.sortValue]).getTime()
        comparison = aDate - bDate
      } else {
        comparison = a[options.sortValue].localeCompare(b[options.sortValue])
      }
      return options.sortOrder === 'ascending' ? comparison : -comparison
    })

    setFilteredRows(result)
  }, [keyValues, options.filterString, options.sortValue, options.sortOrder])
  const handleFilterInput = useCallback((event: JSX.TargetedEvent<HTMLInputElement>) => {
    const inputValue = event.currentTarget.value
    updateOptions({
      filterString: inputValue,
    })
  }, [updateOptions])

  const handleSortChange = useCallback((key: 'sortValue' | 'sortOrder') => {
    return (event: JSX.TargetedEvent<HTMLInputElement>) => {
      const inputValue = event.currentTarget.value
      updateOptions({
        [key]: inputValue,
      })
    }
  }, [updateOptions])

  const handleDatabaseChange = useCallback((event: JSX.TargetedEvent<HTMLInputElement>) => {
    const newDatabaseId = event.currentTarget.value as DatabaseOptionId
    updateOptions({ selectedDatabaseId: newDatabaseId })
  }, [updateOptions])

  const toggleSortVisibility = useCallback(() => {
    setIsSortVisible(prev => !prev)
  }, [])

  useMount(() => {
    console.log('List mounted')
    resizeWindow()
  })

  useUnmount(() => {
    console.log('List unmounted')
  })

  useDebounce(filterAndSortList, 300, [options.filterString, options.sortValue, options.sortOrder, keyValues])

  return (
    <Fragment>
      <style jsx>{`
          @keyframes rotate360 {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .rotate {
            animation: rotate360 1s linear infinite;
          }
          .dropdown-container {
            position: relative;
          }
          .dropdown-content {
            position: absolute;
            top: 100%;
            left: 0;
            z-index: 50;
            width: 100%;
          }
        `}</style>
      <div className="flex flex-col gap-2 p-2">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-grow min-w-[200px]">
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 12 12" fill="currentColor" style={{ marginTop: '8px' }}>
                <path fillRule="evenodd" clipRule="evenodd" d="M7.77857 2.16302C6.22788 0.612329 3.71371 0.612325 2.16302 2.16302C0.612325 3.71371 0.612329 6.22788 2.16302 7.77857C3.57925 9.1948 5.79912 9.3176 7.35472 8.14697C7.36325 8.15676 7.37217 8.16633 7.38149 8.17565L10.0414 10.8355C10.2607 11.0548 10.6162 11.0548 10.8355 10.8355C11.0548 10.6162 11.0548 10.2607 10.8355 10.0414L8.17565 7.38149C8.16633 7.37217 8.15676 7.36325 8.14697 7.35472C9.3176 5.79912 9.1948 3.57925 7.77857 2.16302ZM2.60422 2.60422C3.91124 1.29719 6.03035 1.2972 7.33737 2.60422C8.6444 3.91124 8.6444 6.03035 7.33737 7.33737C6.03035 8.6444 3.91124 8.6444 2.60422 7.33737C1.2972 6.03035 1.29719 3.91124 2.60422 2.60422Z" fill="currentColor" />
              </svg>
            </div>
            <Textbox
              variant="border"
              placeholder={t('List.filter.placeholder')}
              value={options.filterString}
              onInput={handleFilterInput}
              className="w-full pr-8 py-2 pl-8"
            />
            {options.filterString.length > 0 && (
              <button
                className="absolute right-2 top-1 text-gray-400 hover:text-gray-600 focus:outline-none z-10"
                onClick={() => updateOptions({ filterString: '' })}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" style={{ marginTop: '4px' }}>
                  <path d="M3 3L13 13M13 3L3 13" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          <span
            className={`icon p-2 rounded-full cursor-pointer transition-colors duration-200 ${isSortVisible
                ? 'bg-blue-100 text-blue-700'
                : 'bg-opacity-50 text-secondary hover:bg-blue-100 hover:text-blue-700'
              }`}
            onClick={toggleSortVisibility}
          >
            filter_list
          </span>

          <span
            className={`icon p-2 rounded-full cursor-pointer transition-colors duration-200 flex items-center justify-center ${fetching
                ? 'bg-blue-100 text-blue-700 rotate'
                : 'bg-opacity-50 text-secondary hover:bg-blue-100 hover:text-blue-700'
              }`}
            onClick={handleFetchClick}
            style={{ width: '32px', height: '32px' }}
          >
            {fetching ? 'autorenew' : 'sync'}
          </span>
        </div>

        {isSortVisible && (
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="dropdown-container flex-grow min-w-[200px]">
              <Dropdown
                variant="border"
                options={sortValueOptions}
                value={options.sortValue}
                onChange={handleSortChange('sortValue')}
              />
            </div>
            <div className="dropdown-container flex-grow min-w-[200px]">
              <Dropdown
                variant="border"
                options={sortOrderOptions}
                value={options.sortOrder}
                onChange={handleSortChange('sortOrder')}
              />
            </div>
          </div>
        )}

        <div className="dropdown-container mt-2">
          <Dropdown
            variant="border"
            options={databaseOptions}
            value={options.selectedDatabaseId}
            onChange={handleDatabaseChange}
          />
        </div>

        <Divider />

        <KeyValueList 
        rows={filteredRows} 
        showRussian={true}  // Вы можете добавить опцию для переключения отображения русского языка
        showUzbek={true}    // Вы можете добавить опцию для переключения отображения узбекского языка
      />

        <Divider />

        <div className="flex justify-between p-2 text-secondary">
          <div className="flex gap-1 align-center">
            <span className="icon">highlight_mouse_cursor</span>
            <span>{t('List.statusBar.text')}</span>
          </div>
          <div>{t('List.statusBar.count', { length: filteredRows.length })}</div>
        </div>
      </div>
    </Fragment>
  )
}