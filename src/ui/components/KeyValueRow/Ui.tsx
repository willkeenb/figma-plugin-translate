/** @jsx h */
/** @jsxFrag Fragment */
import { h, Fragment } from 'preact'
import { IconButton } from '@create-figma-plugin/ui'
import clsx from 'clsx'
import type { NotionKeyValue } from '@/types/common'
import { CustomIconButton } from '@/ui/components/Custom/CustomIconButton'

type KeyRowProps = {
  keyValue: NotionKeyValue
  onClick: () => void
  handleCopyKey: () => void
  handleOpenInBrowser: (url: string) => void
  t: (key: string) => string
}

export const KeyRow = ({ keyValue, onClick, handleCopyKey, handleOpenInBrowser, t }: KeyRowProps) => (
  <div className="w-full flex relative items-center">
    <div
      className="w-full flex p-1 rounded-2 font-medium hover:bg-hover cursor-pointer hover:text-link"
      onClick={onClick}
      title={t('KeyValueRow.clickToApply')}
    >
      {keyValue.key}
    </div>
    <CustomIconButton
      onClick={() => handleOpenInBrowser(keyValue.url)}
      title={t('keyValueRow.openInBrowser')}
      icon="open_in_new"
      className="w-6 h-6 bg-selectedTertiary rounded"
    />
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
  handleEdit: () => void
  inputRef: preact.RefObject<HTMLInputElement>
  t: (key: string) => string
}

export const ValueRowContent = ({
  value,
  editing,
  editedValue,
  handleInputChange,
  handleApplyValue,
  handleSaveChanges,
  handleCancel,
  handleEdit,
  inputRef,
  t
}: ValueRowContentProps) => (
  <div className="w-full flex relative">
    <div
      className={clsx(
        "w-full p-1 pr-8 rounded-2 cursor-pointer text-secondary hover:text-link",
        !editing && "hover:bg-hover"
      )}
      onClick={() => !editing && handleApplyValue()}
      title={editing ? '' : t('KeyValueRow.clickToApply')}
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
    <div className="flex h-6 gap-1">
        {editing ? (
          <>
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
          </>
        ) : (
          <CustomIconButton
            onClick={handleEdit}
            title={t('keyValueRow.edit')}
            icon="edit"
            className="w-6 h-6 bg-selectedTertiary rounded"
          />
        )}
      </div>
  </div>
)