/** @jsx h */
/** @jsxFrag Fragment */
import { h, Fragment } from 'preact'
import { IconButton } from '@create-figma-plugin/ui'
import clsx from 'clsx'
import type { NotionKeyValue } from '@/types/common'

type KeyRowProps = {
  keyValue: NotionKeyValue
  onClick: (id: string) => void
  handleCopyKey: () => void
  handleOpenInBrowser: (url: string) => void
  t: (key: string) => string
}

export const KeyRow = ({ keyValue, onClick, handleCopyKey, handleOpenInBrowser, t }: KeyRowProps) => (
  <div className="w-full flex relative items-center h-10 group">
    <div 
      className="w-10 py-1 text-secondary cursor-pointer hover:text-link"
      onClick={handleCopyKey}
      title={t('keyValueRow.copyKey')}
    >
      Key
    </div>
    <div 
      className="flex-1 p-1 rounded-2 hover:bg-hover cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap"
      onClick={() => onClick(keyValue.id)}
    >
      {keyValue.key}
    </div>
    <IconButton 
      onClick={() => handleOpenInBrowser(keyValue.url)} 
      title={t('keyValueRow.openInBrowser')}
      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    >
      <span className="icon">open_in_new</span>
    </IconButton>
  </div>
)

type ValueRowContentProps = {
  lang: 'ru' | 'uz'
  value: string
  editing: boolean
  editedValue: string
  handleInputChange: (e: h.JSX.TargetedEvent<HTMLInputElement, Event>) => void
  inputRef: preact.RefObject<HTMLInputElement>
  t: (key: string) => string
}

export const ValueRowContent = ({ 
  lang, 
  value, 
  editing, 
  editedValue, 
  handleInputChange, 
  inputRef,
  t
}: ValueRowContentProps) => (
  <div className="flex-1 relative">
    <div 
      className={clsx(
        "w-full p-1 pr-8 rounded-2 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap",
        !editing && "hover:bg-hover"
      )}
      title={editing ? '' : t('KeyValueList.clickToApply')}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={editedValue}
          onChange={handleInputChange}
          className="w-full border-none bg-transparent focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        value
      )}
    </div>
  </div>
)

type ValueRowButtonsProps = {
  editing: boolean
  handleSaveChanges: () => void
  handleCancel: () => void
  handleEdit: () => void
  t: (key: string) => string
}

export const ValueRowButtons = ({ 
  editing, 
  handleSaveChanges, 
  handleCancel, 
  handleEdit,
  t
}: ValueRowButtonsProps) => (
  <div className="absolute right-0 top-0 bottom-0 flex items-center">
    {editing ? (
      <>
        <IconButton onClick={handleSaveChanges} title={t('keyValueRow.saveChanges')}>
          <span className="icon">check</span>
        </IconButton>
        <IconButton onClick={handleCancel} title={t('keyValueRow.cancel')}>
          <span className="icon">close</span>
        </IconButton>
      </>
    ) : (
      <IconButton 
        onClick={handleEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 edit-button"
        title={t('keyValueRow.edit')}
      >
        <span className="icon">edit</span>
      </IconButton>
    )}
  </div>
)