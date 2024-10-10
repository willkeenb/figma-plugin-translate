import { StateUpdater, useCallback, useState } from 'preact/hooks'
import { useTranslation } from 'react-i18next'
import { useDebounce, useMount, useUnmount } from 'react-use'
import { emit } from '@create-figma-plugin/utilities'
import { INTEGRATION_TOKEN, KEY_PROPERTY_NAME, DatabaseOptionId } from '@/constants'
import { useKeyValuesStore, useStore } from '@/ui/Store'
import useNotion from '@/ui/hooks/useNotion'
import useCache from '@/ui/hooks/useCache'
import useOptions from '@/ui/hooks/useOptions'
import { ListState, ListActions } from './types'
import { NotionKeyValue, SortOrder, SortValue } from '@/types/common'

export function useListLogic(): [ListState, ListActions] {
  const { t } = useTranslation()
  const options = useStore()
  const { keyValues } = useKeyValuesStore()
  const { updateOptions } = useOptions()
  const { fetchNotion } = useNotion()
  const { saveCacheToDocument } = useCache()

  const [state, setState] = useState<ListState>({
    fetching: false,
    filteredRows: [],
    isSortVisible: false,
    showUzbek: false,
    isDropdownVisible: false,
    searchTerm: '',
  })

  const handleFetchClick = useCallback(async () => {
    if (!options.selectedDatabaseId || state.fetching) {
      return;
    }
    setState(prev => ({ ...prev, fetching: true }))
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
      setState(prev => ({ ...prev, filteredRows: tempKeyValues }))
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
      setState(prev => ({ ...prev, fetching: false }))
    }
  }, [options.selectedDatabaseId, fetchNotion, saveCacheToDocument, t, state.fetching])

  const filterAndSortList = useCallback(() => {
    let result = [...keyValues]
    if (state.searchTerm) {
      result = result.filter(row => {
        const keyProperty = row.key.toLowerCase()
        const valueRuProperty = row.valueRu.toLowerCase()
        const valueUzProperty = row.valueUz.toLowerCase()
        const filterLower = state.searchTerm.toLowerCase()
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
    setState(prev => ({ ...prev, filteredRows: result }))
  }, [keyValues, state.searchTerm, options.sortValue, options.sortOrder])

  const handleSearchChange = useCallback((event: Event) => {
    const inputValue = (event.target as HTMLInputElement).value
    setState(prev => ({ ...prev, searchTerm: inputValue }))
  }, [])

  const handleSortChange = useCallback((key: 'sortValue' | 'sortOrder') => {
    return (event: Event) => {
      const inputValue = (event.target as HTMLInputElement).value as SortValue | SortOrder
      updateOptions({
        [key]: inputValue,
      })
    }
  }, [updateOptions])

  const handleDatabaseSelect = useCallback((databaseId: DatabaseOptionId) => {
    updateOptions({ selectedDatabaseId: databaseId })
    setState(prev => ({ ...prev, isDropdownVisible: false, searchTerm: '' }))
  }, [updateOptions])

  const toggleDropdown = useCallback(() => {
    setState(prev => ({ ...prev, isDropdownVisible: !prev.isDropdownVisible }))
  }, [])

  const toggleSortVisibility = useCallback(() => {
    setState(prev => ({ ...prev, isSortVisible: !prev.isSortVisible }))
  }, [])

  const toggleUzbek = useCallback(() => {
    setState(prev => ({ ...prev, showUzbek: !prev.showUzbek }))
  }, [])

  useMount(() => {
    console.log('List mounted')
  })

  useUnmount(() => {
    console.log('List unmounted')
  })

  useDebounce(filterAndSortList, 1, [state.searchTerm, options.sortValue, options.sortOrder, keyValues])

  return [
    state,
    {
      handleFetchClick,
      handleSearchChange,
      handleSortChange,
      handleDatabaseSelect,
      toggleDropdown,
      toggleSortVisibility,
      toggleUzbek,
    }
  ]
}