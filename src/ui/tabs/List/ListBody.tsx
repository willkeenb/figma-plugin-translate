import { h } from 'preact'
import KeyValueList from '@/ui/components/KeyValueList'
import { ListState } from './types'

interface ListBodyProps {
  state: ListState
}

export function ListBody({ state }: ListBodyProps) {
  return (
      <KeyValueList 
        rows={state.filteredRows}
        showUzbek={state.showUzbek}
      />
  )
}