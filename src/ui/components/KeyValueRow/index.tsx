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

type ValueRowProps = {
  lang: 'ru' | 'uz'
  value: string
  editedValue: string
  editing: boolean
  inputRef: preact.RefObject<HTMLInputElement>
  handleCopy: (value: string) => void
  handleInputChange: (e: h.JSX.TargetedEvent<HTMLInputElement, Event>) => void
  handleSaveChanges: (lang: 'ru' | 'uz') => void
  handleCancel: (lang: 'ru' | 'uz') => void
  setEditing: (value: boolean) => void
  handleApplyValue: (keyValue: NotionKeyValue, lang: 'ru' | 'uz') => void
  keyValue: NotionKeyValue
  t: (key: string) => string
}

const ValueRow = ({
  lang,
  value,
  editedValue,
  editing,
  inputRef,
  handleCopy,
  handleInputChange,
  handleSaveChanges,
  handleCancel,
  setEditing,
  handleApplyValue,
  keyValue,
  t
}: ValueRowProps) => (
  <div className="w-full flex items-center relative group">
    <ValueRowContent
      lang={lang}
      value={value}
      editing={editing}
      editedValue={editedValue}
      handleInputChange={handleInputChange}
      handleApplyValue={() => handleApplyValue(keyValue, lang)}
      handleSaveChanges={() => handleSaveChanges(lang)}
      handleCancel={() => handleCancel(lang)}
      inputRef={inputRef}
      t={t}
    />
  </div>
)

export default function KeyValueRow({ keyValue, onClick, showUzbek }: RowProps) {
  const { t } = useTranslation()
  const { getKeyWithQueryStrings, handleOpenInBrowser } = useKeyValueApi()
  const {
    isEditing, setIsEditing,
    editingRu, setEditingRu, editingUz, setEditingUz,
    editedKey, setEditedKey,
    editedValueRu, setEditedValueRu, editedValueUz, setEditedValueUz,
    keyInputRef, ruInputRef, uzInputRef,
    handleCopy, handleSaveChanges, handleCancel, handleApplyValue, handleApplyKey
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
        handleSaveChanges={() => handleSaveChanges('key')}
        handleCancel={() => handleCancel('key')}
        keyInputRef={keyInputRef}
      />
      <ValueRow
        lang="ru"
        value={keyValue.valueRu}
        editedValue={editedValueRu}
        editing={editingRu}
        inputRef={ruInputRef}
        handleCopy={handleCopy}
        handleInputChange={(e) => setEditedValueRu(e.currentTarget.value)}
        handleSaveChanges={handleSaveChanges}
        handleCancel={handleCancel}
        setEditing={setEditingRu}
        handleApplyValue={handleApplyValue}
        keyValue={keyValue}
        t={t}
      />
      {showUzbek && (
        <ValueRow
          lang="uz"
          value={keyValue.valueUz}
          editedValue={editedValueUz}
          editing={editingUz}
          inputRef={uzInputRef}
          handleCopy={handleCopy}
          handleInputChange={(e) => setEditedValueUz(e.currentTarget.value)}
          handleSaveChanges={handleSaveChanges}
          handleCancel={handleCancel}
          setEditing={setEditingUz}
          handleApplyValue={handleApplyValue}
          keyValue={keyValue}
          t={t}
        />
      )}
    </li>
  )
}