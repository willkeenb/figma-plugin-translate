import { getDatabaseById } from '@/main/notionApi';

export async function devModeCode() {
  console.log('Dev mode initialized');

  await loadNotionData();

  figma.codegen.on('generate', async (event): Promise<CodegenResult[]> => {
    console.log('Generate event triggered', event);
    const { node } = event;

    console.log('Node type:', node.type);

    if (node.type !== 'TEXT' && node.type !== 'FRAME' && node.type !== 'SECTION') {
      console.log('Node type not supported');
      return [];
    }

    let key = node.name.replace(/^#/, '');
    console.log('Key:', key);

    // Return an empty array as a default case
    return [];
  });
}

async function loadNotionData() {
  const databaseId = 'your-database-id'; // Define your database ID here

  try {
    console.log('Starting to load Notion data');
    const data = await getDatabaseById(databaseId);
    const { ruData, uzData } = formatNotionData(data);
    const changes: { [key: string]: { [key: string]: [string, string] } } = {
      "Изменено": {},
      "Добавлено": {},
      "Изменены ключи": {}
    };

    const allKeys = new Set([...Object.keys(ruData), ...Object.keys(uzData)]);

    allKeys.forEach(key => {
      const newRuValue = ruData[key] || '';
      const newUzValue = uzData[key] || '';

      if (ruData[key] && uzData[key]) {
        changes["Добавлено"][key] = [newRuValue, newUzValue];
      }
    });

    figma.ui.postMessage({
      type: 'show-changes',
      data: changes
    });

    console.log('Notion data loaded into cache');
  } catch (error) {
    console.error('Error loading Notion data:', error);
  }
}

export function formatNotionData(data: any): { ruData: Record<string, string>, uzData: Record<string, string> } {
  // Example implementation
  const ruData: Record<string, string> = {};
  const uzData: Record<string, string> = {};

  data.forEach((item: any) => {
    ruData[item.key] = item.valueRu;
    uzData[item.key] = item.valueUz;
  });

  return { ruData, uzData };
}