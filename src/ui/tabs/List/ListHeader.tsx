import { h } from 'preact'
import { CustomIconButton } from '@/ui/components/Custom/CustomIconButton'
import { Dropdown, DropdownOption } from '@create-figma-plugin/ui'
import { ListState, ListActions } from './types'
import { DatabaseOptionId } from '@/constants'

interface ListHeaderProps {
  state: ListState
  actions: ListActions
  t: (key: string) => string
  sortValueOptions: DropdownOption[]
  sortOrderOptions: DropdownOption[]
  databaseOptions: { text: string; value: string }[]
  options: any
}

export function ListHeader({ state, actions, t, sortValueOptions, sortOrderOptions, databaseOptions, options }: ListHeaderProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center p-2">
      <input
        type="text"
        value={state.searchTerm}
        onChange={actions.handleSearchChange}
        placeholder={t('List.search.placeholder')}
        className="flex-grow min-w-[200px] bg-transparent outline-none border rounded p-2"
      />
      
      <div className="relative">
        <CustomIconButton
          onClick={actions.toggleDropdown}
          title={t('List.selectDatabase')}
          icon="database"
          className="p-2 rounded hover:bg-hover"
        />
        {state.isDropdownVisible && (
          <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-10">
            {databaseOptions.map(option => (
              <div
                key={option.value}
                onClick={() => actions.handleDatabaseSelect(option.value as DatabaseOptionId)}
                className="p-2 hover:bg-hover cursor-pointer"
              >
                {option.text}
                {option.value === options.selectedDatabaseId && (
                  <span className="ml-2">✓</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <CustomIconButton
        onClick={actions.toggleUzbek}
        title={state.showUzbek ? t('hideUzbek') : t('showUzbek')}
        icon={state.showUzbek ? "visibility" : "visibility_off"}
        className="p-2 rounded hover:bg-hover"
      />

      <div className="relative">
        <CustomIconButton
          onClick={actions.toggleSortVisibility}
          title={t('List.toggleSort')}
          icon={state.isSortVisible ? "expand_less" : "expand_more"}
          className="p-2 rounded hover:bg-hover"
        />
        {state.isSortVisible && (
          <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-10">
            <div className="p-2">
              <Dropdown
                options={sortValueOptions}
                value={options.sortValue}
                onChange={actions.handleSortChange('sortValue')}
                className="mb-2"
              />
              <Dropdown
                options={sortOrderOptions}
                value={options.sortOrder}
                onChange={actions.handleSortChange('sortOrder')}
              />
            </div>
          </div>
        )}
      </div>

      <CustomIconButton
        onClick={actions.handleFetchClick}
        title={t('List.fetchData')}
        icon="refresh"
        className="p-2 rounded hover:bg-hover"
        spin={state.fetching}
      />
    </div>
  )
}