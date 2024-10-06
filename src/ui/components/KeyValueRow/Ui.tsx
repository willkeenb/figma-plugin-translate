/** @jsx h */
/** @jsxFrag Fragment */
import { h, Fragment } from 'preact'
import clsx from 'clsx'
import type { NotionKeyValue } from '@/types/common'
import { CustomIconButton } from '@/ui/components/Custom/CustomIconButton'

type KeyRowProps = {
  keyValue: NotionKeyValue
  onClick: () => void
  handleCopyKey: () => void
  handleOpenInBrowser: (url: string) => void
  t: (key: string) => string
  isEditing: boolean
  setIsEditing: (value: boolean) => void
  editedKey: string
  setEditedKey: (value: string) => void
  handleSaveChanges: () => void
  handleCancel: () => void
  keyInputRef: preact.RefObject<HTMLInputElement>
}

export const KeyRow = ({
  keyValue,
  onClick,
  handleCopyKey,
  handleOpenInBrowser,
  t,
  isEditing,
  setIsEditing,
  editedKey,
  setEditedKey,
  handleSaveChanges,
  handleCancel,
  keyInputRef
}: KeyRowProps) => (
  <div 
    className="w-full flex p-2 rounded-2 border border-transparent cursor-pointer hover:bg-hover hover:text-link text-wrap"
    onClick={() => !isEditing && onClick()} // Добавьте этот обработчик клика
  >
    <input
      ref={keyInputRef}
      value={isEditing ? editedKey : keyValue.key}
      onChange={(e) => isEditing && setEditedKey(e.currentTarget.value)}
      className={`w-full bg-transparent text-wrap font-medium mt-1 pr-8 ${isEditing ? '' : 'pointer-events-none'}`}
      // Удалите обработчик клика отсюда
      readOnly={!isEditing}
      title={t('KeyValueRow.clickToApply')}
    />
    <div className="flex gap-1">
      {isEditing ? (
        <>
          <CustomIconButton
            onClick={handleSaveChanges}
            title={t('keyValueRow.saveChanges')}
            icon="check"
            className="w-6 h-6 bg-selectedTertiary rounded mr-1"
          />
          <CustomIconButton
            onClick={handleCancel}
            title={t('keyValueRow.cancel')}
            icon="close"
            className="w-6 h-6 bg-selectedTertiary rounded mr-1"
          />
        </>
      ) : (
        <CustomIconButton
          onClick={() => setIsEditing(true)}
          title={t('keyValueRow.edit')}
          icon="edit"
          className="w-6 h-6 bg-selectedTertiary rounded mr-1"
        />
      )}
      <CustomIconButton
        onClick={() => handleOpenInBrowser(keyValue.url)}
        title={t('keyValueRow.openInBrowser')}
        icon="open_in_new"
        className="w-6 h-6 bg-selectedTertiary rounded"
      />
    </div>
  </div>
)

type ValueRowContentProps = {
  lang: 'ru' | 'uz'
  value: string
  editing: boolean
  editedValue: string
  handleInputChange: (e: h.JSX.TargetedEvent<HTMLInputElement, Event>) => void
  handleApplyValue: () => void
  handleSaveChanges: () => void
  handleCancel: () => void
  inputRef: preact.RefObject<HTMLInputElement>
  t: (key: string) => string
}

export const ValueRowContent = ({
  lang,
  value,
  editing,
  editedValue,
  handleInputChange,
  handleApplyValue,
  handleSaveChanges,
  handleCancel,
  inputRef,
  t
}: ValueRowContentProps) => (
  <div 
    className="w-full flex p-2 rounded-2 border border-transparent hover:bg-hover cursor-pointer hover:text-link text-wrap"
    onClick={() => !editing && handleApplyValue()} // Добавьте этот обработчик клика
  >
    <input
      ref={inputRef}
      value={editing ? editedValue : value}
      onChange={handleInputChange}
      className={`w-full bg-transparent text-wrap font-medium mt-1 pr-8 focus:outline-none ${editing ? '' : 'pointer-events-none'}`}
      // Удалите обработчик клика отсюда
      readOnly={!editing}
      title={editing ? '' : t('KeyValueRow.clickToApply')}
    />
    {editing && (
      <div className="flex h-full items-center">
        <CustomIconButton
          onClick={handleSaveChanges}
          title={t('keyValueRow.saveChanges')}
          icon="check"
          className="mr-1"
        />
        <CustomIconButton
          onClick={handleCancel}
          title={t('keyValueRow.cancel')}
          icon="close"
        />
      </div>
    )}
  </div>
)