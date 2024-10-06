/** @jsx h */
import { h } from 'preact'
import { useRef } from 'preact/hooks'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useUpdateEffect } from 'react-use'
import KeyValueRow from '@/ui/components/KeyValueRow'
import { useKeyValueListLogic } from './logic'
import type { NotionKeyValue } from '@/types/common'

type KeyValueProps = {
  rows: NotionKeyValue[]
  className?: string
  showUzbek: boolean
}

export default function KeyValueList({ rows, className, showUzbek }: KeyValueProps) {
  const { t } = useTranslation()
  const listRef = useRef<HTMLUListElement>(null)
  const {
    handleRowClick,
    handleScroll,
    tmpScrollPosition,
    scrollPositionRestored,
    setScrollPositionRestored,
  } = useKeyValueListLogic(0) // Передайте начальную позицию прокрутки

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
  }, [rows, handleScroll])

  useUpdateEffect(() => {
    if (!listRef.current) {
      return
    }

    if (scrollPositionRestored) {
      listRef.current.scrollTo({
        top: tmpScrollPosition,
      })
    } else {
      listRef.current.scrollTo({
        top: 0,
      })
      setScrollPositionRestored(true)
    }
  }, [rows, tmpScrollPosition, scrollPositionRestored])

  return (
    <div className={clsx('relative', className)}>
      {rows.length > 0 ? (
        <ul className="h-full overflow-x-hidden overflow-y-auto" ref={listRef}>
          {rows.map((row) => (
            <KeyValueRow
              key={row.id}
              keyValue={row}
              onClick={handleRowClick}
              showUzbek={showUzbek}
            />
          ))}
        </ul>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-secondary">
          {t('KeyValueList.empty')}
        </div>
      )}

      {!scrollPositionRestored && (
        <div className="absolute inset-0 z-10 bg-primary flex flex-col items-center justify-center text-secondary">
          {t('KeyValueList.loading')}
        </div>
      )}
    </div>
  )
}