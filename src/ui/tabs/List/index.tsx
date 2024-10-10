/** @jsx h */
import { Fragment, h } from 'preact'
import { useTranslation } from 'react-i18next'
import { Divider } from '@create-figma-plugin/ui'
import { useListLogic } from './useListLogic'
import { ListHeader } from './ListHeader'
import { ListBody } from './ListBody'
import { ListFooter } from './ListFooter'
import { useStore } from '@/ui/Store'
import { DATABASE_OPTIONS } from '@/constants'
import { TFunction } from '@/types/i18n'

export default function List() {
  const { t } = useTranslation()
  const [state, actions] = useListLogic()
  const options = useStore()

  const sortValueOptions = [
    { text: t('List.sortValue.key'), value: 'key' },
    { text: t('List.sortValue.valueRu'), value: 'valueRu' },
    { text: t('List.sortValue.valueUz'), value: 'valueUz' },
    { text: t('List.sortValue.created_time'), value: 'created_time' },
    { text: t('List.sortValue.last_edited_time'), value: 'last_edited_time' },
  ]

  const sortOrderOptions = [
    { text: t('List.sortOrder.ascending'), value: 'ascending' },
    { text: t('List.sortOrder.descending'), value: 'descending' },
  ]

  const databaseOptions = DATABASE_OPTIONS.map(option => ({
    text: t(option.labelKey),
    value: option.id
  }))

  return (
      <><ListHeader
      state={state}
      actions={actions}
      t={t as TFunction}
      sortValueOptions={sortValueOptions}
      sortOrderOptions={sortOrderOptions}
      databaseOptions={databaseOptions}
      options={options} /><Divider /><ListBody state={state} /><Divider /><ListFooter state={state} t={t as TFunction} /></>
  )
}