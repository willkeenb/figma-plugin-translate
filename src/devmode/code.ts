import { fetchNotion } from '@/main/notionApi'
import { DATABASE_OPTIONS } from '@/constants'
import type { NotionKeyValue } from '@/types/common'

let cache: NotionKeyValue[] = []

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

    let valueRu = '';
    let valueUz = '';

    const cacheEntry = cache.find(item => item.key === key);
    if (cacheEntry) {
      console.log('Cache entry found');
      valueRu = cacheEntry.valueRu;
      valueUz = cacheEntry.valueUz;
    } else {
      console.log('Cache entry not found, using default values');
      if (node.type === 'TEXT') {
        valueRu = node.characters;
        valueUz = node.characters;
      } else {
        const textNode = node.findOne((n: SceneNode) => n.type === 'TEXT') as TextNode | null;
        if (textNode) {
          valueRu = textNode.characters;
          valueUz = textNode.characters;
        } else {
          valueRu = node.name;
          valueUz = node.name;
        }
      }
    }

    console.log('Values:', { valueRu, valueUz });

    const ruJSON = JSON.stringify({ [key]: valueRu }, null, 2);
    const uzJSON = JSON.stringify({ [key]: valueUz }, null, 2);

    console.log('Generated JSON:', { ruJSON, uzJSON });

    return [
      {
        title: "ru-RU.json",
        language: "JSON",
        code: ruJSON
      },
      {
        title: "uz-UZ.json",
        language: "JSON",
        code: uzJSON
      }
    ];
  });

  figma.codegen.on('preferenceschange', async (event): Promise<void> => {
    console.log('Preferences changed:', event);
  });
}

async function loadNotionData() {
  try {
    console.log('Starting to load Notion data');
    const firstDatabaseId = DATABASE_OPTIONS[0].id;
    console.log('Database ID:', firstDatabaseId);
    cache = await fetchNotion({
      selectedDatabaseId: firstDatabaseId,
      keyPropertyName: 'key',
      valuePropertyNameRu: 'ru',
      valuePropertyNameUz: 'uz',
      keyValuesArray: []
    });
    console.log('Notion data loaded into cache:', cache);
  } catch (error) {
    console.error('Error loading Notion data:', error);
  }
}