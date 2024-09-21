import { useTranslation } from 'react-i18next'
import { DATABASE_OPTIONS, PROXY_URL } from '@/constants'

import type {
  NotionFomula,
  NotionKeyValue,
  NotionPage,
  NotionRichText,
  NotionTitle,
} from '@/types/common'

import type { DatabaseOptionId } from '@/types/database'

export default function useNotion() {
  const { t } = useTranslation()

  async function fetchNotion(options: {
    integrationToken: string
    selectedDatabaseId: DatabaseOptionId
    keyPropertyName: string
    valuePropertyName: string
    nextCursor?: string
    keyValuesArray: NotionKeyValue[]
  }) {
    console.log('fetchNotion', options)

    if (!options.selectedDatabaseId) {
      throw new Error(t('notifications.Fetch.error.noDatabaseSelected'));
    }

    const selectedDatabase = DATABASE_OPTIONS.find(db => db.id === options.selectedDatabaseId);
    if (!selectedDatabase) {
      throw new Error(t('notifications.Fetch.error.invalidDatabase'));
    }

    const databaseId = selectedDatabase.id

    const apiUrl = `https://api.notion.com/v1/databases/${options.selectedDatabaseId}/query`;
    const fullUrl = `${PROXY_URL}/${encodeURIComponent(apiUrl)}`;

    const reqParams = {
      page_size: 100,
      start_cursor: options.nextCursor || undefined,
    }

    try {
      console.log('Sending request to:', fullUrl);
      console.log('Request params:', reqParams);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${options.integrationToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reqParams),
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Notion API error:', errorText);
        throw new Error(`${t('notifications.Fetch.error.failedFetch')}: ${errorText}`)
      }

      const resJson = await response.json()
      console.log('Response:', resJson)
      const pages = resJson.results as NotionPage[]


      if (!pages || pages.length === 0) {
        throw new Error(t('notifications.Fetch.error.noPages'))
      }

      pages.forEach(row => {
        if (!row.properties[options.keyPropertyName]) {
          throw new Error(t('notifications.Fetch.error.wrongKeyName'))
        }

        if (!row.properties[options.valuePropertyName]) {
          throw new Error(t('notifications.Fetch.error.wrongValueName'))
        }

        const keyProperty = row.properties[options.keyPropertyName]
        if (
          keyProperty.type !== 'title' &&
          keyProperty.type !== 'rich_text' &&
          keyProperty.type !== 'formula'
        ) {
          throw new Error(t('notifications.Fetch.error.wrongKeyType'))
        }
        const key = getPropertyValue(keyProperty)

        const valueProperty = row.properties[options.valuePropertyName]
        if (
          valueProperty.type !== 'title' &&
          valueProperty.type !== 'rich_text' &&
          valueProperty.type !== 'formula'
        ) {
          throw new Error(t('notifications.Fetch.error.wrongValueType'))
        }
        const value = getPropertyValue(valueProperty)

        options.keyValuesArray.push({
          id: row.id,
          key,
          value,
          created_time: row.created_time,
          last_edited_time: row.last_edited_time,
          url: row.url,
        })
      })

      if (resJson.has_more) {
        await fetchNotion({ ...options, nextCursor: resJson.next_cursor })
      }
    } catch (error) {
      console.error('Error in fetchNotion:', error)
      throw error
    }
  }

  function getPropertyValue(
    property: NotionTitle | NotionFomula | NotionRichText,
  ): string {
    let value: string = ''

    if (property.type === 'title') {
      value = property.title[0]?.plain_text || ''
    } else if (property.type === 'rich_text') {
      value = property.rich_text[0]?.plain_text || ''
    } else if (property.type === 'formula') {
      value = property.formula.string || ''
    }

    return value
  }

  return { fetchNotion }
}