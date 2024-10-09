import fetch from 'node-fetch';
import { DATABASE_OPTIONS } from '@/constants';
import type { NotionKeyValue } from '@/types/common';

const TOKEN_NOTION = 'secret_WNj2iszw5vY5n2Omxl2R6tfZkpvRfYixoke7haZpc7G';
const databaseId = DATABASE_OPTIONS[0].id;

async function getDatabaseById(databaseId: string): Promise<any> {
  const url = `https://api.notion.com/v1/databases/${databaseId}/query`;
  let allResults: any[] = [];
  let startCursor: string | null = null;

  while (true) {
    const payload: any = { page_size: 100 };
    if (startCursor) {
      payload.start_cursor = startCursor;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN_NOTION}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as { results: any[], next_cursor: string | null };
    allResults = allResults.concat(data.results);

    startCursor = data.next_cursor;
    if (!startCursor) {
      break;
    }
  }

  return { results: allResults };
}

function replaceLineSeparator(text: string): string {
  return text.replace(/\u2028/g, '\n');
}

function formatNotionData(data: any): { ruData: Record<string, string>, uzData: Record<string, string> } {
  const ruData: Record<string, string> = {};
  const uzData: Record<string, string> = {};

  data.results.forEach((result: any) => {
    const properties = result.properties;

    const keyProperty = properties.key?.title || [];
    const key = keyProperty[0]?.text?.content || null;

    const ruValueProperty = properties.ru?.rich_text || [];
    const ruValue = replaceLineSeparator(ruValueProperty[0]?.text?.content || '');

    const uzValueProperty = properties.uz?.rich_text || [];
    const uzValue = replaceLineSeparator(uzValueProperty[0]?.text?.content || '');

    if (key) {
      if (ruValue) {
        ruData[key.toLowerCase()] = ruValue;
      }
      if (uzValue) {
        uzData[key.toLowerCase()] = uzValue;
      }
    }
  });

  return { ruData, uzData };
}