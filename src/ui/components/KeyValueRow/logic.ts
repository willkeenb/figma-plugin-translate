import { useState, useEffect, useRef, useCallback } from 'preact/hooks'
import { emit } from '@create-figma-plugin/utilities'
import { useCopyToClipboard } from 'react-use'
import type { NotionKeyValue } from '@/types/common'
import type { ApplyKeyValueHandler, NotifyHandler, UpdateKeyValueHandler } from '@/types/eventHandler'

export function useKeyValueLogic(keyValue: NotionKeyValue, getKeyWithQueryStrings: (keyValue: NotionKeyValue, lang: 'ru' | 'uz') => string) {
  const [, copyToClipboardFn] = useCopyToClipboard()
  const [isEditing, setIsEditing] = useState(false)
  const [editedKey, setEditedKey] = useState(keyValue.key)
  const [editedValueRu, setEditedValueRu] = useState(keyValue.valueRu)
  const [editedValueUz, setEditedValueUz] = useState(keyValue.valueUz)
  const [activeField, setActiveField] = useState<'key' | 'ru' | 'uz'>('key')
  const keyInputRef = useRef<HTMLTextAreaElement>(null)
  const ruInputRef = useRef<HTMLTextAreaElement>(null)
  const uzInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditedKey(keyValue.key)
    setEditedValueRu(keyValue.valueRu)
    setEditedValueUz(keyValue.valueUz)
  }, [keyValue])

  const handleApplyValue = useCallback((keyValue: NotionKeyValue, lang: 'ru' | 'uz') => {
    if (!isEditing) {
      const applyKeyValue = {
        ...keyValue,
        value: lang === 'uz' ? keyValue.valueUz : keyValue.valueRu
      }
      console.log('Applying key-value:', applyKeyValue)
      emit<ApplyKeyValueHandler>('APPLY_KEY_VALUE', applyKeyValue)
    }
  }, [isEditing])
  
  const handleApplyKey = useCallback(() => {
    if (!isEditing) {
      const applyKeyValue = {
        ...keyValue,
        value: keyValue.valueRu
      }
      console.log('Applying key:', applyKeyValue)
      emit<ApplyKeyValueHandler>('APPLY_KEY_VALUE', applyKeyValue)
    }
  }, [keyValue, isEditing])

  const handleCopy = useCallback((value: string) => {
    copyToClipboardFn(value)
    emit<NotifyHandler>('NOTIFY', {
      message: 'Copied to clipboard',
      options: { timeout: 3000 }
    })
  }, [copyToClipboardFn])

  const handleSaveChanges = useCallback((e: Event) => {
    e.stopPropagation();
    const updatedKeyValue = {
      ...keyValue,
      key: editedKey,
      valueRu: editedValueRu,
      valueUz: editedValueUz
    }
    emit<UpdateKeyValueHandler>('UPDATE_KEY_VALUE', updatedKeyValue)
    setIsEditing(false)
  }, [keyValue, editedKey, editedValueRu, editedValueUz])

  const resetTextareaHeight = useCallback(() => {
    [keyInputRef, ruInputRef, uzInputRef].forEach(ref => {
      if (ref.current) {
        ref.current.style.height = 'auto';
      }
    });
  }, []);
  
  const handleCancel = useCallback((e: Event) => {
    e.stopPropagation();
    setEditedKey(keyValue.key)
    setEditedValueRu(keyValue.valueRu)
    setEditedValueUz(keyValue.valueUz)
    setIsEditing(false)
  }, [keyValue])

  const handleFieldFocus = useCallback((field: 'key' | 'ru' | 'uz') => {
    setActiveField(field)
  }, [])

  return {
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
    handleApplyValue,
    handleApplyKey,
    handleCopy,
    handleSaveChanges,
    handleCancel,
    resetTextareaHeight,
    handleFieldFocus
  }
}