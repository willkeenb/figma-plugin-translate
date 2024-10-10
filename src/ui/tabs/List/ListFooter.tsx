import { h } from 'preact'
import { ListState } from './types'
import { TFunction } from '@/types/i18n'

interface ListFooterProps {
  state: ListState
  t: TFunction
}

export function ListFooter({ state, t }: ListFooterProps) {
  return (
    <div className="flex justify-between p-2 text-secondary bg-white">
      <div className="flex gap-1 items-center">
        <span className="icon">highlight_mouse_cursor</span>
        <span>{t('List.statusBar.text')}</span>
      </div>
      <div>{t('List.statusBar.count', { length: state.filteredRows.length })}</div>
    </div>
  )
}