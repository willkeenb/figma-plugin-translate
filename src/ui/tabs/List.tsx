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
import { INTEGRATION_TOKEN, KEY_PROPERTY_NAME, DATABASE_OPTIONS, VALUE_PROPERTY_OPTIONS } from '@/constants'
import type { DatabaseOptionId, ValuePropertyName } from '@/constants'
import { useKeyValuesStore, useStore } from '@/ui/Store'
import useNotion from '@/ui/hooks/useNotion'
import useCache from '@/ui/hooks/useCache'
import useOptions from '@/ui/hooks/useOptions'
import useResizeWindow from '@/ui/hooks/useResizeWindow'
import type { NotionKeyValue, SortOrder, SortValue } from '@/types/common'
import KeyValueList from '@/ui/components/KeyValueList'

interface ValuePropertyToggleProps {
  value: ValuePropertyName;
  onChange: (value: ValuePropertyName) => void;
  options: typeof VALUE_PROPERTY_OPTIONS;
}

const IconRuFlag = () => (
  <svg width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      fill="white"
    />
    <path
      d="M21.378 15.4782C21.78 14.3949 22 13.2232 22 12C22 10.7768 21.78 9.60506 21.378 8.52174H2.62199C2.22004 9.60506 2 10.7768 2 12C2 13.2232 2.22004 14.3949 2.62199 15.4782L12 16.3478L21.378 15.4782Z"
      fill="#0052B4"
    />
    <path
      d="M12 22C16.2996 22 19.9651 19.2862 21.378 15.4782H2.62199C4.03492 19.2862 7.70035 22 12 22Z"
      fill="#D80027"
    />
  </svg>
);

const IconUzFlag = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.47221 8.95655C2.16588 9.91624 1.99998 10.9386 2.00002 11.9999C1.99998 13.0612 2.16592 14.0837 2.47225 15.0434L12 15.4782L21.5278 15.0435C21.834 14.0837 22 13.0612 22 12C22 10.9387 21.8341 9.91624 21.5278 8.95651L12 8.52175L2.47221 8.95655Z" fill="white" />
    <path d="M21.5278 8.95651L12 8.52175L2.47221 8.95655C2.38143 9.24108 2.30283 9.53115 2.23733 9.82607H21.7617C21.6962 9.53111 21.6185 9.24097 21.5278 8.95651Z" fill="#D80027" />
    <path d="M2.23742 14.1738C2.30285 14.4687 2.38147 14.7588 2.47225 15.0434L12 15.4782L21.5278 15.0435C21.6185 14.7589 21.6962 14.4687 21.7617 14.1738H2.23742Z" fill="#D80027" />
    <path d="M12.0004 22C16.4619 22 20.2401 19.078 21.5278 15.0435L2.47225 15.0434C3.75994 19.0779 7.53896 22 12.0004 22Z" fill="#6DA544" />
    <path d="M12.0004 2.00002C7.53896 2.00006 3.75998 4.92207 2.47221 8.95655L21.5278 8.95651C20.2401 4.92195 16.462 1.99998 12.0004 2.00002Z" fill="#338AF3" />
    <path d="M6.56997 6.13046C6.56997 5.19386 7.22821 4.41144 8.10724 4.21949C7.97216 4.18996 7.83196 4.17398 7.68798 4.17398C6.60744 4.17398 5.73146 5.04992 5.73146 6.1305C5.73146 7.21109 6.60736 8.08702 7.68798 8.08702C7.83196 8.08702 7.97212 8.071 8.10724 8.04151C7.22825 7.84948 6.56997 7.06706 6.56997 6.13046Z" fill="#F0F0F0" />
    <path d="M9.26325 7.01978L9.39567 7.4274H9.82426L9.47755 7.67935L9.60997 8.08697L9.26325 7.83506L8.91645 8.08697L9.04892 7.67935L8.70216 7.4274H9.13075L9.26325 7.01978Z" fill="#F0F0F0" />
    <path d="M10.6313 7.01978L10.7638 7.4274H11.1924L10.8456 7.67935L10.9781 8.08697L10.6313 7.83506L10.2846 8.08697L10.417 7.67935L10.0703 7.4274H10.4989L10.6313 7.01978Z" fill="#F0F0F0" />
    <path d="M11.9996 7.01974L12.132 7.42736H12.5606L12.2139 7.67931L12.3463 8.08693L11.9996 7.83501L11.6528 8.08693L11.7853 7.67931L11.4385 7.42736H11.8671L11.9996 7.01974Z" fill="#F0F0F0" />
    <path d="M13.3677 7.01978L13.5002 7.4274H13.9288L13.582 7.67935L13.7145 8.08697L13.3677 7.83506L13.0209 8.08697L13.1534 7.67935L12.8066 7.4274H13.2352L13.3677 7.01978Z" fill="#F0F0F0" />
    <path d="M14.7358 7.01978L14.8683 7.4274H15.2969L14.9502 7.67935L15.0826 8.08697L14.7358 7.83506L14.3891 8.08697L14.5215 7.67935L14.1748 7.4274H14.6034L14.7358 7.01978Z" fill="#F0F0F0" />
    <path d="M10.6313 5.59693L10.7638 6.00451H11.1924L10.8456 6.2565L10.9781 6.66408L10.6313 6.41217L10.2846 6.66408L10.417 6.2565L10.0703 6.00451H10.4989L10.6313 5.59693Z" fill="#F0F0F0" />
    <path d="M11.9996 5.59681L12.132 6.00439H12.5606L12.2139 6.25638L12.3463 6.66396L11.9996 6.41205L11.6528 6.66396L11.7853 6.25638L11.4385 6.00439H11.8671L11.9996 5.59681Z" fill="#F0F0F0" />
    <path d="M13.3677 5.59693L13.5002 6.00451H13.9288L13.582 6.2565L13.7145 6.66408L13.3677 6.41217L13.0209 6.66408L13.1534 6.2565L12.8066 6.00451H13.2352L13.3677 5.59693Z" fill="#F0F0F0" />
    <path d="M14.7358 5.59693L14.8683 6.00451H15.2969L14.9502 6.2565L15.0826 6.66408L14.7358 6.41217L14.3891 6.66408L14.5215 6.2565L14.1748 6.00451H14.6034L14.7358 5.59693Z" fill="#F0F0F0" />
    <path d="M11.9996 4.17384L12.132 4.5815H12.5606L12.2139 4.83341L12.3463 5.24107L11.9996 4.98915L11.6528 5.24107L11.7853 4.83341L11.4385 4.5815H11.8671L11.9996 4.17384Z" fill="#F0F0F0" />
    <path d="M13.3677 4.17384L13.5002 4.5815H13.9288L13.582 4.83341L13.7145 5.24107L13.3677 4.98915L13.0209 5.24107L13.1534 4.83341L12.8066 4.5815H13.2352L13.3677 4.17384Z" fill="#F0F0F0" />
    <path d="M14.7358 4.17384L14.8683 4.5815H15.2969L14.9502 4.83341L15.0826 5.24107L14.7358 4.98915L14.3891 5.24107L14.5215 4.83341L14.1748 4.5815H14.6034L14.7358 4.17384Z" fill="#F0F0F0" />
  </svg>
);

const ValuePropertyToggle = ({ value, onChange, options }: ValuePropertyToggleProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex rounded-full text-white bg-gray-200 bg-opacity-50 border border-solid">
      {options.map((option) => (
        <button
          key={option.value}
          className={`flex items-center justify-center w-1/2 p-1 rounded-full transition-colors duration-200 ${value === option.value ? 'bg-primary bg-opacity-50 border-b border-solid' : 'text-white'
            }`}
          onClick={() => onChange(option.value)}
        >
          {option.value === 'ru' ? <IconRuFlag /> : <IconUzFlag />}
        </button>
      ))}
    </div>
  );
};

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
      { text: t('List.sortValue.value'), value: 'value' },
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
    if (!options.selectedDatabaseId || !options.valuePropertyName) {
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
        valuePropertyName: options.valuePropertyName,
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
  }, [options.selectedDatabaseId, options.valuePropertyName, fetchNotion, saveCacheToDocument, t])

  const filterAndSortList = useCallback(() => {
    let result = [...keyValues]

    if (options.filterString) {
      result = result.filter(row => {
        const keyProperty = row.key.toLowerCase()
        const valueProperty = row.value.toLowerCase()
        return (
          keyProperty.includes(options.filterString.toLowerCase()) ||
          valueProperty.includes(options.filterString.toLowerCase())
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

  useEffect(() => {
    filterAndSortList()
  }, [filterAndSortList])

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

  const handleValuePropertyChange = useCallback((newValue: ValuePropertyName) => {
    updateOptions({ valuePropertyName: newValue })
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

  const [sortField, setSortField] = useState<SortValue>('key')
  const [sortDirection, setSortDirection] = useState<SortOrder>('ascending')

  const toggleSort = (field: SortValue) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'ascending' ? 'descending' : 'ascending')
    } else {
      setSortField(field)
      setSortDirection('ascending')
    }}
    
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
            {/* Строка поиска */}
            <div className="relative flex-grow min-w-[200px]">
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 12 12" fill="currentColor" style={{marginTop: '8px'}}>
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" style={{marginTop: '4px'}}>
                    <path d="M3 3L13 13M13 3L3 13" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* фильтр */}
            <span 
              className={`icon p-2 rounded-full cursor-pointer transition-colors duration-200 ${
                isSortVisible 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-opacity-50 text-secondary hover:bg-blue-100 hover:text-blue-700'
              }`}
              onClick={toggleSortVisibility}
            >
              filter_list
            </span>
            
            {/* обновить */}
            <span 
              className={`icon p-2 rounded-full cursor-pointer transition-colors duration-200 flex items-center justify-center ${
                fetching 
                  ? 'bg-blue-100 text-blue-700 rotate'
                  : 'bg-opacity-50 text-secondary hover:bg-blue-100 hover:text-blue-700'
              }`}
              onClick={handleFetchClick}
              style={{ width: '32px', height: '32px' }}
            >
              {fetching ? 'autorenew' : 'sync'}
            </span>
            
            {/* язык */}
            <ValuePropertyToggle
              value={options.valuePropertyName}
              onChange={handleValuePropertyChange}
              options={VALUE_PROPERTY_OPTIONS}
            />
          </div>
          
          {/* Выпадающие списки для сортировки */}
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
          
          {/* Выпадающие списки для базы данных */}
          <div className="dropdown-container mt-2">
            <Dropdown
              variant="border"
              options={databaseOptions}
              value={options.selectedDatabaseId}
              onChange={handleDatabaseChange}
            />
          </div>
    
          <Divider />
    
          <KeyValueList rows={filteredRows} />
    
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