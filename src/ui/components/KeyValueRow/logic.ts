import { useState, useEffect, useRef, useCallback } from 'preact/hooks'
import { emit } from '@create-figma-plugin/utilities'
import { useCopyToClipboard } from 'react-use'
import type { NotionKeyValue } from '@/types/common'
import type { ApplyKeyValueHandler, NotifyHandler, UpdateKeyValueHandler } from '@/types/eventHandler'

export function useKeyValueLogic(keyValue: NotionKeyValue, getKeyWithQueryStrings: (keyValue: NotionKeyValue, lang: 'ru' | 'uz') => string) {
  const [, copyToClipboardFn] = useCopyToClipboard()
  const [isEditing, setIsEditing] = useState(false)
  const [editingRu, setEditingRu] = useState(false)
  const [editingUz, setEditingUz] = useState(false)
  const [editedKey, setEditedKey] = useState(keyValue.key)
  const [editedValueRu, setEditedValueRu] = useState(keyValue.valueRu)
  const [editedValueUz, setEditedValueUz] = useState(keyValue.valueUz)
  const keyInputRef = useRef<HTMLInputElement>(null)
  const ruInputRef = useRef<HTMLInputElement>(null)
  const uzInputRef = useRef<HTMLInputElement>(null)


  useEffect(() => {
    setEditedKey(keyValue.key)
    setEditedValueRu(keyValue.valueRu)
    setEditedValueUz(keyValue.valueUz)
  }, [keyValue])

  useEffect(() => {
    if (isEditing && keyInputRef.current) {
      keyInputRef.current.focus()
    }
    if (editingRu && ruInputRef.current) {
      ruInputRef.current.focus()
    }
    if (editingUz && uzInputRef.current) {
      uzInputRef.current.focus()
    }
  }, [isEditing, editingRu, editingUz])

  const handleApplyValue = useCallback((keyValue: NotionKeyValue, lang: 'ru' | 'uz') => {
    const applyKeyValue = {
      ...keyValue,
      value: lang === 'uz' ? keyValue.valueUz : keyValue.valueRu
    }
    console.log('Applying key-value:', applyKeyValue)
    emit<ApplyKeyValueHandler>('APPLY_KEY_VALUE', applyKeyValue)
  }, [])
  
  const handleApplyKey = useCallback(() => {
    const applyKeyValue = {
      ...keyValue,
      value: keyValue.valueRu // или keyValue.valueUz, в зависимости от вашей логики
    }
    console.log('Applying key:', applyKeyValue)
    emit<ApplyKeyValueHandler>('APPLY_KEY_VALUE', applyKeyValue)
  }, [keyValue])

  const handleCopy = useCallback((value: string) => {
    copyToClipboardFn(value)
    emit<NotifyHandler>('NOTIFY', {
      message: 'Copied to clipboard',
      options: { timeout: 3000 }
    })
  }, [copyToClipboardFn])

  const handleSaveChanges = useCallback((field: 'key' | 'ru' | 'uz') => {
    const updatedKeyValue = {
      ...keyValue,
      key: field === 'key' ? editedKey : keyValue.key,
      valueRu: field === 'ru' ? editedValueRu : keyValue.valueRu,
      valueUz: field === 'uz' ? editedValueUz : keyValue.valueUz
    }
    emit<UpdateKeyValueHandler>('UPDATE_KEY_VALUE', updatedKeyValue)
    setIsEditing(false)
    setEditingRu(false)
    setEditingUz(false)
  }, [keyValue, editedKey, editedValueRu, editedValueUz])

  const handleCancel = useCallback((field: 'key' | 'ru' | 'uz') => {
    if (field === 'key') {
      setEditedKey(keyValue.key)
      setIsEditing(false)
    } else if (field === 'ru') {
      setEditedValueRu(keyValue.valueRu)
      setEditingRu(false)
    } else {
      setEditedValueUz(keyValue.valueUz)
      setEditingUz(false)
    }
  }, [keyValue])

  return {
    isEditing,
    setIsEditing,
    editingRu,
    setEditingRu,
    editingUz,
    setEditingUz,
    editedKey,
    setEditedKey,
    editedValueRu,
    setEditedValueRu,
    editedValueUz,
    setEditedValueUz,
    keyInputRef,
    ruInputRef,
    uzInputRef,
    handleApplyValue,
    handleApplyKey,
    handleCopy,
    handleSaveChanges,
    handleCancel
  }
}