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
  handleSaveChanges: (e: Event) => void
  handleCancel: (e: Event) => void
  keyInputRef: preact.RefObject<HTMLTextAreaElement>
  isActive: boolean
  onFocus: () => void
  resetTextareaHeight: () => void
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
  resetTextareaHeight,
  keyInputRef,
  isActive,
  onFocus
}: KeyRowProps) => {
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  return (
    <div
      className={clsx(
        "w-full flex p-2 rounded-2 border",
        isEditing 
          ? isActive
            ? "bg-selectedTertiary border-blue-300"
            : "border-gray-300"
          : "border-transparent hover:bg-hover cursor-pointer hover:text-link"
      )}
      onClick={(e) => {
        if (!isEditing) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <div className="flex-grow">
        <textarea
          ref={keyInputRef}
          value={isEditing ? editedKey : keyValue.key}
          onChange={(e) => {
            setEditedKey(e.currentTarget.value);
            adjustTextareaHeight(e.currentTarget);
          }}
          onInput={(e) => adjustTextareaHeight(e.currentTarget)}
          className={clsx(
            "w-full bg-transparent text-wrap font-medium pr-8 focus:outline-none resize-none overflow-hidden",
            isEditing ? "cursor-text" : "pointer-events-none"
          )}
          readOnly={!isEditing}
          title={isEditing ? '' : t('KeyValueRow.clickToApply')}
          onFocus={(e) => {
            onFocus();
            adjustTextareaHeight(e.currentTarget);
          }}
          onClick={(e) => e.stopPropagation()}
          rows={1}
        />
      </div>
      <div className={clsx("flex gap-1", isEditing ? "opacity-100" : "opacity-0 hover:opacity-100 transition-opacity")}>
        {isEditing ? (
          <>
            <CustomIconButton
              onClick={(e) => {
                e.stopPropagation();
                handleSaveChanges(e);
                resetTextareaHeight();
              }}
              title={t('keyValueRow.saveChanges')}
              icon="check"
              className="w-6 h-6 bg-selectedTertiary rounded mr-1 cursor-pointer hover:bg-blue-200"
            />
            <CustomIconButton
              onClick={(e) => {
                e.stopPropagation();
                handleCancel(e);
                resetTextareaHeight();
              }}
              title={t('keyValueRow.cancel')}
              icon="close"
              className="w-6 h-6 bg-selectedTertiary rounded mr-1 cursor-pointer hover:bg-red-200"
            />
          </>
        ) : (
          <>
            <CustomIconButton
              onClick={() => setIsEditing(true)}
              title={t('keyValueRow.edit')}
              icon="edit"
              className="w-6 h-6 bg-selectedTertiary rounded mr-1 cursor-pointer hover:bg-blue-200"
            />
            <CustomIconButton
              onClick={() => handleOpenInBrowser(keyValue.url)}
              title={t('keyValueRow.openInBrowser')}
              icon="open_in_new"
              className="w-6 h-6 bg-selectedTertiary rounded cursor-pointer hover:bg-green-200"
            />
          </>
        )}
      </div>
    </div>
  );
};

type ValueRowContentProps = {
  lang: 'ru' | 'uz'
  value: string
  editing: boolean
  editedValue: string
  handleInputChange: (e: h.JSX.TargetedEvent<HTMLTextAreaElement, Event>) => void
  handleApplyValue: () => void
  inputRef: preact.RefObject<HTMLTextAreaElement>
  t: (key: string) => string
  isActive: boolean
  onFocus: () => void
  resetTextareaHeight: () => void

}

export const ValueRowContent = ({
  lang,
  value,
  editing,
  editedValue,
  handleInputChange,
  handleApplyValue,
  inputRef,
  t,
  isActive,
  resetTextareaHeight,
  onFocus
}: ValueRowContentProps) => {
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  return (
    <div
      className={clsx(
        "w-full flex p-2 rounded-2 border",
        editing 
          ? isActive
            ? "bg-selectedTertiary border-blue-300"
            : "border-gray-300"
          : "border-transparent hover:bg-hover cursor-pointer hover:text-link"
      )}
      onClick={(e) => {
        if (!editing) {
          e.stopPropagation();
          handleApplyValue();
        }
      }}
    >
            <textarea
        ref={inputRef}
        value={editing ? editedValue : value}
        onChange={(e) => {
          handleInputChange(e);
          adjustTextareaHeight(e.currentTarget);
        }}
        onInput={(e) => adjustTextareaHeight(e.currentTarget)}
        className={clsx(
          "w-full bg-transparent text-wrap font-medium mt-1 pr-8 focus:outline-none resize-none overflow-hidden",
          editing ? "cursor-text" : "pointer-events-none"
        )}
        readOnly={!editing}
        title={editing ? '' : t('KeyValueRow.clickToApply')}
        onFocus={(e) => {
          onFocus();
          adjustTextareaHeight(e.currentTarget);
        }}
        onClick={(e) => e.stopPropagation()}
        rows={1}
      />
    </div>
  );
};