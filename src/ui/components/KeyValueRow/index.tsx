/** @jsx h */
import { h } from 'preact'
import { useTranslation } from 'react-i18next'
import { useKeyValueLogic } from './logic'
import { useKeyValueApi } from './api'
import { KeyRow, ValueRowContent } from './Ui'
import type { NotionKeyValue } from '@/types/common'

type RowProps = {
  keyValue: NotionKeyValue
  onClick: (id: string) => void
  showUzbek: boolean
}

export default function KeyValueRow({ keyValue, onClick, showUzbek }: RowProps) {
  const { t } = useTranslation()
  const { getKeyWithQueryStrings, handleOpenInBrowser } = useKeyValueApi()
  const {
    isEditing,
    setIsEditing,
    editedKey,
    setEditedKey,
    editedValueRu,
    setEditedValueRu,
    editedValueUz,
    setEditedValueUz,
    activeField,
    keyInputRef,
    ruInputRef,
    uzInputRef,
    handleCopy,
    handleSaveChanges,
    handleCancel,
    handleApplyValue,
    handleApplyKey,
    handleFieldFocus,
    resetTextareaHeight
  } = useKeyValueLogic(keyValue, getKeyWithQueryStrings)

  const handleCopyKey = () => handleCopy(keyValue.key)

  return (
    <li className="border-b border-solid gap-1 py-2 flex flex-col">
      <KeyRow
        keyValue={keyValue}
        onClick={handleApplyKey}
        handleCopyKey={handleCopyKey}
        handleOpenInBrowser={handleOpenInBrowser}
        t={t}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        editedKey={editedKey}
        setEditedKey={setEditedKey}
        handleSaveChanges={(e: Event) => handleSaveChanges(e)}
        handleCancel={(e: Event) => handleCancel(e)}
        keyInputRef={keyInputRef}
        isActive={isEditing && activeField === 'key'}
        onFocus={() => handleFieldFocus('key')}
        resetTextareaHeight={resetTextareaHeight}
      />
      <ValueRowContent
        lang="ru"
        value={keyValue.valueRu}
        editing={isEditing}
        editedValue={editedValueRu}
        handleInputChange={(e) => setEditedValueRu(e.currentTarget.value)}
        handleApplyValue={() => handleApplyValue(keyValue, 'ru')}
        inputRef={ruInputRef}
        t={t}
        isActive={isEditing && activeField === 'ru'}
        onFocus={() => handleFieldFocus('ru')}
        resetTextareaHeight={resetTextareaHeight}
      />
      {showUzbek && (
        <ValueRowContent
          lang="uz"
          value={keyValue.valueUz}
          editing={isEditing}
          editedValue={editedValueUz}
          handleInputChange={(e) => setEditedValueUz(e.currentTarget.value)}
          handleApplyValue={() => handleApplyValue(keyValue, 'uz')}
          inputRef={uzInputRef}
          t={t}
          isActive={isEditing && activeField === 'uz'}
          onFocus={() => handleFieldFocus('uz')}
          resetTextareaHeight={resetTextareaHeight}
        />
      )}
    </li>
  )
}