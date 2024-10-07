import { PROXY_URL, INTEGRATION_TOKEN } from '@/constants'
import type { NotionKeyValue } from '@/types/common'

// Функция для создания rich text объекта
const createRichText = (content: string, options: { 
  bold?: boolean, 
  italic?: boolean, 
  strikethrough?: boolean, 
  underline?: boolean, 
  code?: boolean, 
  color?: string 
} = {}) => ({
  type: 'text',
  text: { content },
  annotations: {
    bold: options.bold || false,
    italic: options.italic || false,
    strikethrough: options.strikethrough || false,
    underline: options.underline || false,
    code: options.code || false,
    color: options.color || 'default'
  }
});

export async function syncWithNotion(updatedFields: Partial<NotionKeyValue>, id: string, originalKeyValue: NotionKeyValue, userName: string) {
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

  const result = await response.json()

  // Формируем сообщение для комментария
  const commentRichText = [
    createRichText(`👤 Изменения внесены пользователем: ${userName}\n\n`, { bold: true }),
    createRichText("Что было изменено:\n")
  ];

  if (updatedFields.key) {
    commentRichText.push(
      createRichText(`🔑 Ключ:\n   `),
      createRichText(originalKeyValue.key, { strikethrough: true, color: 'red' }),
      createRichText(` ➡️ `),
      createRichText(updatedFields.key, { bold: true, color: 'green' }),
      createRichText(`\n`)
    );
  }
  if (updatedFields.valueRu) {
    commentRichText.push(
      createRichText(`🇷🇺 Русский:\n   `),
      createRichText(originalKeyValue.valueRu, { strikethrough: true, color: 'red' }),
      createRichText(` ➡️ `),
      createRichText(updatedFields.valueRu, { bold: true, color: 'green' }),
      createRichText(`\n`)
    );
  }
  if (updatedFields.valueUz) {
    commentRichText.push(
      createRichText(`🇺🇿 Узбекский:\n   `),
      createRichText(originalKeyValue.valueUz, { strikethrough: true, color: 'red' }),
      createRichText(` ➡️ `),
      createRichText(updatedFields.valueUz, { bold: true, color: 'green' }),
      createRichText(`\n`)
    );
  }

  // Добавляем временную метку
  const now = new Date();
  commentRichText.push(createRichText(`\n⏰ Время изменения: ${now.toLocaleString()}`, { italic: true }));

  // Добавляем комментарий после успешного обновления
  await addCommentToNotion(id, commentRichText);

  return result;
}

export async function addCommentToNotion(pageId: string, commentRichText: any[]) {
  const apiUrl = `https://api.notion.com/v1/comments`
  const fullUrl = `${PROXY_URL}/${encodeURIComponent(apiUrl)}`

  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${INTEGRATION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { page_id: pageId },
      rich_text: commentRichText
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to add comment to Notion: ${errorText}`)
  }

  return await response.json()
}

export async function fetchNotion(options: {
  selectedDatabaseId: string
  keyPropertyName: string
  valuePropertyNameRu: string
  valuePropertyNameUz: string
  nextCursor?: string
  keyValuesArray: NotionKeyValue[]
}) {
  const apiUrl = `https://api.notion.com/v1/databases/${options.selectedDatabaseId}/query`
  const fullUrl = `${PROXY_URL}/${encodeURIComponent(apiUrl)}`

  const reqParams = {
    page_size: 100,
    start_cursor: options.nextCursor || undefined,
  }

  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${INTEGRATION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reqParams),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch from Notion: ${errorText}`)
  }

  return await response.json()
}