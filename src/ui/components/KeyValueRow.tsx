/** @jsx h */
import { type JSX, h } from 'preact'

import { Button } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from 'react-use'

import useNotionKeyValue from '@/ui/hooks/useNotionKeyValue'

import type { NotionKeyValue } from '@/types/common'
import type { ApplyKeyValueHandler, NotifyHandler } from '@/types/eventHandler'

type CopyButtonProps = {
  type: 'key' | 'value'
  title: string
  keyValue: NotionKeyValue
  selected: boolean
  className?: string
}
type RowProps = {
  keyValue: NotionKeyValue
  onClick: (id: string) => void
  selected: boolean
}

// Компонент кнопки копирования
function CopyButton({
  type,
  title,
  keyValue,
  selected,
  className,
}: CopyButtonProps) {
  const { t } = useTranslation()
  const [state, copyToClipboard] = useCopyToClipboard()
  const { getKeyWithQueryStrings } = useNotionKeyValue()

  function handleClick(event: JSX.TargetedMouseEvent<HTMLButtonElement>) {
    // Предотвращаем всплытие события
    event.stopPropagation()

    let copyValue = ''

    // Определяем, что копировать: ключ или значение
    if (type === 'key') {
      copyValue = getKeyWithQueryStrings(keyValue)
    } else if (type === 'value') {
      copyValue = keyValue.value
    }

    copyToClipboard(copyValue)
    console.log('copied', copyValue)

    // Отправляем уведомление о копировании
    emit<NotifyHandler>('NOTIFY', {
      message: t('notifications.KeyValueRow.copy', { title }),
    })
  }

  return (
    <div className={className}>
      <button
        type="button"
        className={clsx(
          'bg-primary rounded-2 w-5 h-5 flex items-center justify-center hover:bg-tertiary active:bg-primary',
          selected &&
            'bg-selected hover:bg-selectedTertiary active:bg-selected',
        )}
        onClick={handleClick}
      >
        <span className="icon text-12 cursor-pointer">content_copy</span>
      </button>
    </div>
  )
}

// Основной компонент строки ключ-значение
export default function KeyValueRow({ keyValue, onClick, selected }: RowProps) {
  const { t } = useTranslation()
  const { getKeyWithQueryStrings } = useNotionKeyValue()

  // Обработчик клика по кнопке "Apply"
  function handleApplyClick(event: JSX.TargetedMouseEvent<HTMLButtonElement>) {
    event.stopPropagation()

    const applyKeyValue: NotionKeyValue = {
      ...keyValue,
      key: getKeyWithQueryStrings(keyValue),
    }

    console.log('handleApplyClick', applyKeyValue)
    emit<ApplyKeyValueHandler>('APPLY_KEY_VALUE', applyKeyValue)
  }

  // Обработчик клика по кнопке "Open in browser"
  function handleOpenClick(event: JSX.TargetedMouseEvent<HTMLButtonElement>) {
    event.stopPropagation()

    // Открываем URL в новой вкладке
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
        <div
          className={clsx(
            'flex-1 p-1 rounded-2 group hover:bg-hover',
            selected && 'hover:bg-selectedSecondary',
          )}
        >
          <div className="relative">
            <span>{keyValue.key}</span>
            <CopyButton
              type="key"
              title={t('KeyValueRow.key')}
              keyValue={keyValue}
              selected={selected}
              className="absolute -right-0_5 -bottom-0_5 hidden group-hover:block"
            />
          </div>
        </div>
      </div>

      {/* Отображение значения */}
      <div className="w-full flex">
        <div className="w-10 py-1 text-secondary">{t('KeyValueRow.value')}</div>
        <div
          className={clsx(
            'flex-1 p-1 rounded-2 group hover:bg-hover',
            selected && 'hover:bg-selectedSecondary',
          )}
        >
          <div className="relative">
            <span>{keyValue.value}</span>
            <CopyButton
              type="value"
              title={t('KeyValueRow.value')}
              keyValue={keyValue}
              selected={selected}
              className="absolute -right-0_5 -bottom-0_5 hidden group-hover:block"
            />
          </div>
        </div>
      </div>

      {/* Дополнительные кнопки для выбранной строки */}
      {selected && (
        <div className="mt-1 flex flex-col gap-1">
          <Button secondary fullWidth onClick={handleApplyClick}>
            {t('KeyValueRow.applyKeyValueButton')}
          </Button>
          <Button secondary fullWidth onClick={handleOpenClick}>
            {t('KeyValueRow.openBrowserButton')}
          </Button>
        </div>
      )}
    </li>
  )
}