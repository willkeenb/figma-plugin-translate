import { PROXY_URL, INTEGRATION_TOKEN } from '@/constants'
import type { NotionKeyValue } from '@/types/common'

type StyleOption = 'b' | 'i' | 's' | 'u' | 'c' | 'gray' | 'brown' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'red' | `${string}_background`;

interface CommentRequestBody {
  parent: { page_id: string };
  rich_text: Array<{
    type: 'text';
    text: { content: string };
    annotations?: {
      bold?: boolean;
      italic?: boolean;
      strikethrough?: boolean;
      underline?: boolean;
      code?: boolean;
      color?: string;
    };
  }>;
}

// Обновленная функция для создания форматированного текста
const style = (content: string, ...styles: StyleOption[]): CommentRequestBody['rich_text'][number] => {
  const annotations: any = {
    bold: styles.includes('b'),
    italic: styles.includes('i'),
    strikethrough: styles.includes('s'),
    underline: styles.includes('u'),
    code: styles.includes('c'),
  };

  const color = styles.find(s => ['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'].includes(s));
  const background = styles.find(s => s.endsWith('_background'));

  if (color && background) {
    annotations.color = `${color}_background`;
  } else if (color) {
    annotations.color = color;
  } else if (background) {
    annotations.color = background;
  }

  return {
    type: 'text',
    text: { content },
    annotations
  };
};

export async function syncWithNotion(
  updatedFields: Partial<Pick<NotionKeyValue, 'key' | 'valueRu' | 'valueUz'>>,
  id: string,
  originalKeyValue: Pick<NotionKeyValue, 'key' | 'valueRu' | 'valueUz'>,
  userName: string
) {
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

  // Функция для отображения значения или "Пусто"
  const displayValue = (value: string | undefined | null) => {
    if (value === undefined || value === null) return "Пусто";
    const trimmedValue = value.trim();
    return trimmedValue === "" ? "Пусто" : trimmedValue;
  };

  // Формируем сообщение для комментария
  const commentRichText = [
    style(`👤  ${userName}\n\n`,),
    style("Что было изменено:\n", 'gray')
  ];

  if (updatedFields.key !== undefined) {
    commentRichText.push(
      style(`🔑  `, 'b'),
      style(displayValue(originalKeyValue.key), 'red_background', 's'),
      style(` → `),
      style(displayValue(updatedFields.key), 'green_background', 'b'),
      style(`\n`)
    );
  }
  if (updatedFields.valueRu !== undefined) {
    commentRichText.push(
      style(`🇷🇺  `, 'b'),
      style(displayValue(originalKeyValue.valueRu), 'red_background', 's'),
      style(` → `),
      style(displayValue(updatedFields.valueRu), 'green_background', 'b'),
      style(`\n`)
    );
  }
  if (updatedFields.valueUz !== undefined) {
    commentRichText.push(
      style(`🇺🇿  `, 'b'),
      style(displayValue(originalKeyValue.valueUz), 'red', 'red_background', 's'),
      style(` → `),
      style(displayValue(updatedFields.valueUz), 'green_background', 'b'),
      style(`\n`)
    );
  }

  // Добавляем комментарий после успешного обновления
  await addCommentToNotion(id, commentRichText);

  return result;
}

export async function addCommentToNotion(pageId: string, commentRichText: CommentRequestBody['rich_text']) {
  const apiUrl = `https://api.notion.com/v1/comments`
  const fullUrl = `${PROXY_URL}/${encodeURIComponent(apiUrl)}`

  const requestBody: CommentRequestBody = {
    parent: { page_id: pageId },
    rich_text: commentRichText
  };

  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${INTEGRATION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      console.error('Response status:', response.status);
      
      // Безопасный способ логирования заголовков
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.error('Response headers:', headers);

      throw new Error(`Failed to add comment to Notion: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in addCommentToNotion:', error);
    throw error;
  }
}

export async function fetchNotion({
  selectedDatabaseId,
  keyPropertyName,
  valuePropertyNameRu,
  valuePropertyNameUz,
  nextCursor,
  keyValuesArray = []
}: {
  selectedDatabaseId: string;
  keyPropertyName: string;
  valuePropertyNameRu: string;
  valuePropertyNameUz: string;
  nextCursor?: string;
  keyValuesArray?: NotionKeyValue[];
}): Promise<NotionKeyValue[]> {
  const apiUrl = `https://api.notion.com/v1/databases/${selectedDatabaseId}/query`
  const fullUrl = `${PROXY_URL}/${encodeURIComponent(apiUrl)}`

  const reqParams = {
    page_size: 100,
    start_cursor: nextCursor || undefined,
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

  const data = await response.json()

  const newKeyValues: NotionKeyValue[] = data.results.map((page: any) => ({
    id: page.id,
    key: page.properties[keyPropertyName]?.title[0]?.plain_text || '',
    valueRu: page.properties[valuePropertyNameRu]?.rich_text[0]?.plain_text || '',
    valueUz: page.properties[valuePropertyNameUz]?.rich_text[0]?.plain_text || '',
    created_time: page.created_time,
    last_edited_time: page.last_edited_time,
    url: page.url,
  }));

  const allKeyValues = [...keyValuesArray, ...newKeyValues];

  if (data.has_more && data.next_cursor) {
    return fetchNotion({
      selectedDatabaseId,
      keyPropertyName,
      valuePropertyNameRu,
      valuePropertyNameUz,
      nextCursor: data.next_cursor,
      keyValuesArray: allKeyValues,
    });
  }

  return allKeyValues;
}