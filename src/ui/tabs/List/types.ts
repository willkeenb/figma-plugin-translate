import { JSX } from 'preact'
import { NotionKeyValue, SortOrder, SortValue } from '@/types/common'
import { DatabaseOptionId } from '@/constants'

export interface ListProps {
  // Если есть какие-то пропсы для List, определите их здесь
}

export interface ListState {
  fetching: boolean
  filteredRows: NotionKeyValue[]
  isSortVisible: boolean
  showUzbek: boolean
  isDropdownVisible: boolean
  searchTerm: string
}

export interface ListActions {
  handleFetchClick: () => Promise<void>
  handleSearchChange: (event: Event) => void
  handleSortChange: (key: 'sortValue' | 'sortOrder') => (event: Event) => void
  handleDatabaseSelect: (databaseId: DatabaseOptionId) => void
  toggleDropdown: () => void
  toggleSortVisibility: () => void
  toggleUzbek: () => void
}