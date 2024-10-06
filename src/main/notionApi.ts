import { PROXY_URL, INTEGRATION_TOKEN } from '@/constants'
import type { NotionKeyValue } from '@/types/common'

export async function syncWithNotion(updatedFields: Partial<NotionKeyValue>, id: string) {
  const apiUrl = `https://api.notion.com/v1/pages/${id}`
  const fullUrl = `${PROXY_URL}/${encodeURIComponent(apiUrl)}`

  const properties: any = {}
  if (updatedFields.key) properties['key'] = { title: [{ text: { content: updatedFields.key } }] }
  if (updatedFields.valueRu) properties['ru'] = { rich_text: [{ text: { content: updatedFields.valueRu } }] }
  if (updatedFields.valueUz) properties['uz'] = { rich_text: [{ text: { content: updatedFields.valueUz } }] }

  const response = await fetch(fullUrl, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${INTEGRATION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ properties }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to sync with Notion: ${errorText}`)
  }

  return await response.json()
}