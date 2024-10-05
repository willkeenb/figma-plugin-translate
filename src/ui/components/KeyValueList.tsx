/** @jsx h */
import { h } from 'preact'
import { useCallback, useRef, useState } from 'preact/hooks'

import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useDebounce, useMount, useUnmount, useUpdateEffect } from 'react-use'

import { useStore } from '@/ui/Store'
import KeyValueRow from '@/ui/components/KeyValueRow'
import useOptions from '@/ui/hooks/useOptions'

import type { NotionKeyValue } from '@/types/common'

type KeyValueProps = {
  rows: NotionKeyValue[]
  className?: string
}

export default function KeyValueList({ rows, className }: KeyValueProps) {
  const { t } = useTranslation()
  const options = useStore()
  const { updateOptions } = useOptions()
  const listRef = useRef<HTMLUListElement>(null)
  const [tmpScrollPosition, setTmpScrollPosition] = useState(0)
  const [scrollPositionRestored, setScrollPositionRestored] = useState(false)

  // Функция, выполняемая при клике на строку
  const handleRowClick = useCallback(
    (id: string) => {
      console.log('handleRowClick', id, options.selectedRowId)

      // Если не выбрано, выбираем
      // Если уже выбрано, снимаем выбор
      if (id !== options.selectedRowId) {
        updateOptions({ selectedRowId: id })
      } else {
        updateOptions({ selectedRowId: null })
      }
    },
    [options.selectedRowId],
  )

  // Функция для обновления позиции прокрутки при скролле
  const handleScroll = useCallback(() => {
    if (listRef.current) {
      setTmpScrollPosition(listRef.current.scrollTop)
    }
  }, [])

  // Обновление позиции прокрутки в Store с задержкой
  // Только когда scrollPositionRestored true
  useDebounce(
    () => {
      if (scrollPositionRestored) {
        console.log('scrollPosition update (debounced)', tmpScrollPosition)
        updateOptions({ scrollPosition: tmpScrollPosition })
      }
    },
    100,
    [tmpScrollPosition],
  )

  useMount(() => {
    console.log('KeyValueList mounted')
  })

  useUnmount(() => {
    console.log('KeyValueList unmounted')
  })

  // При изменении rows
  // Если позиция прокрутки не восстановлена → восстанавливаем
  // Если позиция прокрутки уже восстановлена (при фильтрации или сортировке) → сбрасываем на 0
  useUpdateEffect(() => {
    console.log(
      'rows updated',
      `scrollPositionRestored: ${scrollPositionRestored}`,
    )

    if (!listRef.current) {
      return
    }

    if (!scrollPositionRestored) {
      console.log('restore scroll position', options.scrollPosition)
      listRef.current.scrollTo({
        top: options.scrollPosition,
      })
      setTmpScrollPosition(options.scrollPosition)
      setScrollPositionRestored(true)
    } else {
      console.log('reset scroll position to top')
      listRef.current.scrollTo({
        top: 0,
      })
      setTmpScrollPosition(0)
    }
  }, [rows])

  // Переустановка слушателя событий при изменении rows
  useUpdateEffect(() => {
    const listElement = listRef.current

    if (listElement) {
      listElement.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (listElement) {
        listElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [rows])

  return (
    <div className={clsx('relative', className)}>
      {rows.length > 0 ? (
        <ul className="h-full overflow-x-hidden overflow-y-auto" ref={listRef}>
          {rows.map((row, index) => (
            <KeyValueRow
              key={row.id}
              keyValue={row}
              onClick={handleRowClick}
              selected={row.id === options.selectedRowId}
            />
          ))}
        </ul>
      ) : (
        // Пустой список
        <div className="h-full flex flex-col items-center justify-center text-secondary">
          {t('KeyValueList.empty')}
        </div>
      )}

      {/* Индикатор загрузки */}
      {!scrollPositionRestored && (
        <div className="absolute inset-0 z-10 bg-primary flex flex-col items-center justify-center text-secondary">
          {t('KeyValueList.loading')}
        </div>
      )}
    </div>
  )
}