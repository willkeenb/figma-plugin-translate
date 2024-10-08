/** @jsx h */
import { Fragment, type JSX, h } from 'preact'
import { useState, useCallback, useMemo, useEffect } from 'preact/hooks'
import {
  Divider,
  Dropdown,
  DropdownOption,
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { useTranslation } from 'react-i18next'
import { useDebounce, useMount, useUnmount } from 'react-use'
import {
  INTEGRATION_TOKEN,
  KEY_PROPERTY_NAME,
  DATABASE_OPTIONS,
  type DatabaseOptionId,
} from '@/constants'
import { useKeyValuesStore, useStore } from '@/ui/Store'
import useNotion from '@/ui/hooks/useNotion'
import useCache from '@/ui/hooks/useCache'
import useOptions from '@/ui/hooks/useOptions'
import useResizeWindow from '@/ui/hooks/useResizeWindow'
import type { NotionKeyValue, SortOrder, SortValue } from '@/types/common'
import KeyValueList from '@/ui/components/KeyValueList'
import { CustomIconButton } from '@/ui/components/Custom/CustomIconButton'

export default function List() {
  const { t } = useTranslation()
  const options = useStore()
  const { keyValues } = useKeyValuesStore()
  const { updateOptions } = useOptions()
  const { resizeWindow } = useResizeWindow()
  const [fetching, setFetching] = useState(false)
  const [filteredRows, setFilteredRows] = useState<NotionKeyValue[]>([])
  const [isSortVisible, setIsSortVisible] = useState(false)
  const [showUzbek, setShowUzbek] = useState(false)
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')


  
  const sortValueOptions: DropdownOption[] = [
    { text: t('List.sortValue.key'), value: 'key' },
    { text: t('List.sortValue.valueRu'), value: 'valueRu' },
    { text: t('List.sortValue.valueUz'), value: 'valueUz' },
    { text: t('List.sortValue.created_time'), value: 'created_time' },
    { text: t('List.sortValue.last_edited_time'), value: 'last_edited_time' },
  ]

  const sortOrderOptions: DropdownOption[] = [
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
    if (!options.selectedDatabaseId || fetching) {
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
  }, [options.selectedDatabaseId, fetchNotion, saveCacheToDocument, t, fetching])

  const filterAndSortList = useCallback(() => {
    let result = [...keyValues]
    if (searchTerm) {
      result = result.filter(row => {
        const keyProperty = row.key.toLowerCase()
        const valueRuProperty = row.valueRu.toLowerCase()
        const valueUzProperty = row.valueUz.toLowerCase()
        const filterLower = searchTerm.toLowerCase()
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
  }, [keyValues, searchTerm, options.sortValue, options.sortOrder])

  const handleSearchChange = useCallback((event: JSX.TargetedEvent<HTMLInputElement>) => {
    const inputValue = event.currentTarget.value
    setSearchTerm(inputValue)
  }, [])

  const handleSortChange = useCallback((key: 'sortValue' | 'sortOrder') => {
    return (event: JSX.TargetedEvent<HTMLInputElement>) => {
      const inputValue = event.currentTarget.value as SortValue | SortOrder
      updateOptions({
        [key]: inputValue,
      })
    }
  }, [updateOptions])

  const handleDatabaseSelect = useCallback((databaseId: DatabaseOptionId) => {
    updateOptions({ selectedDatabaseId: databaseId })
    setIsDropdownVisible(false)
    setSearchTerm('')
  }, [updateOptions])

  const toggleDropdown = useCallback(() => {
    setIsDropdownVisible(prev => !prev)
  }, [])

  const toggleSortVisibility = useCallback(() => {
    setIsSortVisible(prev => !prev)
  }, [])

  const toggleUzbek = useCallback(() => {
    setShowUzbek(prev => !prev)
  }, [])

  useMount(() => {
    console.log('List mounted')
  })

  useUnmount(() => {
    console.log('List unmounted')
  })

  useDebounce(filterAndSortList, 1, [searchTerm, options.sortValue, options.sortOrder, keyValues])

  return (
    <Fragment>
      <div className="flex flex-wrap gap-2 items-center p-2">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={t('List.search.placeholder')}
          className="flex-grow min-w-[200px] bg-transparent outline-none border rounded p-2"
        />
        
        <div className="relative">
          <CustomIconButton
            onClick={toggleDropdown}
            title={t('List.selectDatabase')}
            icon="database"
            className="p-2 rounded hover:bg-hover"
          />
          {isDropdownVisible && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-10">
              {databaseOptions.map(option => (
                <div
                  key={option.value}
                  onClick={() => handleDatabaseSelect(option.value as DatabaseOptionId)}
                  className="p-2 hover:bg-hover cursor-pointer"
                >
                  {t(option.text)}
                  {option.value === options.selectedDatabaseId && (
                    <span className="ml-2">✓</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
  
        <CustomIconButton
          onClick={toggleUzbek}
          title={showUzbek ? t('hideUzbek') : t('showUzbek')}
          icon={showUzbek ? "visibility" : "visibility_off"}
          className="p-2 rounded hover:bg-hover"
        />
  
        <div className="relative">
          <CustomIconButton
            onClick={toggleSortVisibility}
            title={t('List.toggleSort')}
            icon={isSortVisible ? "expand_less" : "expand_more"}
            className="p-2 rounded hover:bg-hover"
          />
          {isSortVisible && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-10">
              <div className="p-2">
                <Dropdown
                  options={sortValueOptions}
                  value={options.sortValue}
                  onChange={handleSortChange('sortValue')}
                  className="mb-2"
                />
                <Dropdown
                  options={sortOrderOptions}
                  value={options.sortOrder}
                  onChange={handleSortChange('sortOrder')}
                />
              </div>
            </div>
          )}
        </div>
  
        <CustomIconButton
          onClick={handleFetchClick}
          title={t('List.fetchData')}
          icon="refresh"
          className="p-2 rounded hover:bg-hover"
          spin={fetching}
        />
      </div>
  
      <Divider />
  
      <KeyValueList 
        rows={filteredRows}
        showUzbek={showUzbek}
      />
  
      <Divider />
  
      <div className="flex justify-between p-2 text-secondary">
        <div className="flex gap-1 align-center">
          <span className="icon">highlight_mouse_cursor</span>
          <span>{t('List.statusBar.text')}</span>
        </div>
        <div>{t('List.statusBar.count', { length: filteredRows.length })}</div>
      </div>
    </Fragment>
  )
}