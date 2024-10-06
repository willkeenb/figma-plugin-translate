import { useState, useEffect, useRef, useCallback } from 'preact/hooks'
import { emit } from '@create-figma-plugin/utilities'
import { useCopyToClipboard } from 'react-use'
import type { NotionKeyValue } from '@/types/common'
import type { ApplyKeyValueHandler, NotifyHandler, UpdateKeyValueHandler } from '@/types/eventHandler'

export function useKeyValueLogic(keyValue: NotionKeyValue, getKeyWithQueryStrings: (keyValue: NotionKeyValue, lang: 'ru' | 'uz') => string) {
  const [, copyToClipboardFn] = useCopyToClipboard()
  const [editingRu, setEditingRu] = useState(false)
  const [editingUz, setEditingUz] = useState(false)
  const [editedValueRu, setEditedValueRu] = useState(keyValue.valueRu)
  const [editedValueUz, setEditedValueUz] = useState(keyValue.valueUz)
  const ruInputRef = useRef<HTMLInputElement>(null)
  const uzInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditedValueRu(keyValue.valueRu)
    setEditedValueUz(keyValue.valueUz)
  }, [keyValue])

  useEffect(() => {
    if (editingRu && ruInputRef.current) {
      ruInputRef.current.focus()
    }
    if (editingUz && uzInputRef.current) {
      uzInputRef.current.focus()
    }
  }, [editingRu, editingUz])

  const handleApplyValue = useCallback((keyValue: NotionKeyValue, lang: 'ru' | 'uz') => {
    const applyKeyValue = {
      ...keyValue,
      key: getKeyWithQueryStrings(keyValue, lang),
      value: lang === 'uz' ? keyValue.valueUz : keyValue.valueRu
    }
    console.log('Applying key-value:', applyKeyValue)
    emit<ApplyKeyValueHandler>('APPLY_KEY_VALUE', applyKeyValue)
  }, [getKeyWithQueryStrings])

  const handleApplyKey = useCallback(() => {
    const applyKeyValue = {
      ...keyValue,
      key: getKeyWithQueryStrings(keyValue, 'ru'),
      value: keyValue.valueRu
    }
    console.log('Applying key:', applyKeyValue)
    emit<ApplyKeyValueHandler>('APPLY_KEY_VALUE', applyKeyValue)
  }, [keyValue, getKeyWithQueryStrings])

  const handleCopy = useCallback((value: string) => {
    copyToClipboardFn(value)
    emit<NotifyHandler>('NOTIFY', {
      message: 'Copied to clipboard',
      options: { timeout: 3000 }
    })
  }, [copyToClipboardFn])

  const handleSaveChanges = useCallback((lang: 'ru' | 'uz') => {
    const updatedKeyValue = {
      ...keyValue,
      valueRu: lang === 'ru' ? editedValueRu : keyValue.valueRu,
      valueUz: lang === 'uz' ? editedValueUz : keyValue.valueUz
    }
    emit<UpdateKeyValueHandler>('UPDATE_KEY_VALUE', updatedKeyValue)
    setEditingRu(false)
    setEditingUz(false)
  }, [keyValue, editedValueRu, editedValueUz])

  const handleCancel = useCallback((lang: 'ru' | 'uz') => {
    if (lang === 'ru') {
      setEditedValueRu(keyValue.valueRu)
      setEditingRu(false)
    } else {
      setEditedValueUz(keyValue.valueUz)
      setEditingUz(false)
    }
  }, [keyValue])

  return {
    editingRu,
    setEditingRu,
    editingUz,
    setEditingUz,
    editedValueRu,
    setEditedValueRu,
    editedValueUz,
    setEditedValueUz,
    ruInputRef,
    uzInputRef,
    handleApplyValue,
    handleApplyKey,
    handleCopy,
    handleSaveChanges,
    handleCancel
  }
}