/** @jsx h */
import { type JSX, h } from 'preact'
import { useState } from 'preact/hooks'

import { Button } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from 'react-use'

import useNotionKeyValue from '@/ui/hooks/useNotionKeyValue'

import type { NotionKeyValue } from '@/types/common'
import type { ApplyKeyValueHandler, NotifyHandler } from '@/types/eventHandler'

type RowProps = {
  keyValue: NotionKeyValue
  onClick: (id: string) => void
  selected: boolean
  showRussian: boolean
  showUzbek: boolean
}

export default function KeyValueRow({ keyValue, onClick, selected, showRussian, showUzbek }: RowProps) {
  const { t } = useTranslation()
  const { getKeyWithQueryStrings } = useNotionKeyValue()
  const [, copyToClipboard] = useCopyToClipboard()

  function handleApplyValue(value: string, lang: 'ru' | 'uz') {
    const applyKeyValue = {
      ...keyValue,
      key: getKeyWithQueryStrings(keyValue, lang),
      value: value
    }

    console.log('Applying key-value:', applyKeyValue)
    emit<ApplyKeyValueHandler>('APPLY_KEY_VALUE', applyKeyValue)
  }

  function handleCopy(value: string, title: string) {
    copyToClipboard(value)
    emit<NotifyHandler>('NOTIFY', {
      message: t('notifications.KeyValueRow.copy', { title }),
    })
  }

  function handleOpenClick(event: JSX.TargetedMouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    window.open(keyValue.url, '_blank', 'noopener, noreferrer')
  }

  return (
    <li
      className={clsx(
        'border-b border-solid border-b-primary p-2 flex flex-col',
        selected && 'bg-selected',
      )}
      onClick={() => onClick(keyValue.id)}
    >
      {/* Отображение ключа */}
      <div className="w-full flex">
        <div className="w-10 py-1 text-secondary">{t('KeyValueRow.key')}</div>
        <div className="flex-1 p-1 rounded-2 group hover:bg-hover">
          <span>{keyValue.key}</span>
        </div>
      </div>

      {/* Отображение значения на русском */}
      <div className="w-full flex">
        <div className="w-10 py-1 text-secondary">RU</div>
        <div 
          className="flex-1 p-1 rounded-2 group hover:bg-hover cursor-pointer"
          onClick={() => handleApplyValue(keyValue.valueRu, 'ru')}
          title={t('KeyValueRow.clickToApply')}
        >
          <span>{keyValue.valueRu}</span>
        </div>
        <button 
          className="ml-2 p-1 rounded-2 hover:bg-tertiary"
          onClick={() => handleCopy(keyValue.valueRu, 'RU')}
          title={t('KeyValueRow.copyToClipboard')}
        >
          📋
        </button>
      </div>

      {/* Отображение значения на узбекском */}
      <div className="w-full flex">
        <div className="w-10 py-1 text-secondary">UZ</div>
        <div 
          className="flex-1 p-1 rounded-2 group hover:bg-hover cursor-pointer"
          onClick={() => handleApplyValue(keyValue.valueUz, 'uz')}
          title={t('KeyValueRow.clickToApply')}
        >
          <span>{keyValue.valueUz}</span>
        </div>
        <button 
          className="ml-2 p-1 rounded-2 hover:bg-tertiary"
          onClick={() => handleCopy(keyValue.valueUz, 'UZ')}
          title={t('KeyValueRow.copyToClipboard')}
        >
          📋
        </button>
      </div>

      {/* Дополнительные кнопки для выбранной строки */}
      {selected && (
        <div className="mt-1 flex flex-col gap-1">
          <Button secondary fullWidth onClick={handleOpenClick}>
            {t('KeyValueRow.openBrowserButton')}
          </Button>
        </div>
      )}
    </li>
  )
}