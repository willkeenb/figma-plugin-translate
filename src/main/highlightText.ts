import { GROUP_ID_KEY } from '@/constants'
import i18n from '@/i18n/main'
import { getTextNodes } from '@/main/util'

import type { NotionKeyValue, TargetTextRange } from '@/types/common'

// Функция для создания прямоугольников подсветки на странице
async function createHighlightRectOnPage(
  keyValues: NotionKeyValue[],
  textNodes: TextNode[],
  pageNode: PageNode,
) {
  console.log('createHighlightRectOnPage', textNodes, pageNode)

  // Массив для хранения текстовых узлов с корректным форматом имени слоя
  let correctLayerNameFormatTextNodes: TextNode[] = []

  // Массивы для хранения прямоугольников
  let rectNodes: RectangleNode[] = []
  const correctRectNodes: RectangleNode[] = []
  const incorrectRectNodes: RectangleNode[] = []

  // Фильтруем текстовые узлы, оставляя только те, чье имя начинается с #
  correctLayerNameFormatTextNodes = textNodes.filter(textNode => {
    console.log(textNode.name)
    return textNode.name.startsWith('#')
  })

  console.log(
    'correctLayerNameFormatTextNodes',
    correctLayerNameFormatTextNodes,
  )

  if (correctLayerNameFormatTextNodes.length === 0) {
    // Если нет подходящих текстовых узлов, завершаем выполнение
    console.log('no matched text')
    return
  }

  // Находим и удаляем ранее созданную группу
  const generatedGroupId = pageNode.getPluginData(GROUP_ID_KEY)
  const previousGeneratedGroup = pageNode.findOne(
    node => node.id === generatedGroupId,
  )
  console.log('generatedGroupId', generatedGroupId)
  console.log('previousGeneratedGroup', previousGeneratedGroup)
  if (previousGeneratedGroup) {
    previousGeneratedGroup.remove()
  }

  // Обрабатываем каждый текстовый узел
  await Promise.all(
    correctLayerNameFormatTextNodes.map(async textNode => {
      // Извлекаем ключ из имени слоя
      const key = textNode.name.split('?')[0].replace(/^#/, '')

      // Ищем соответствующий объект в keyValues
      const matchedKeyValue = keyValues.find(keyValue => {
        return keyValue.key === key
      })

      // Создаем прямоугольник подсветки (только для видимых слоев)
      if (textNode.absoluteRenderBounds) {
        // Создаем и настраиваем прямоугольник
        const rect = figma.createRectangle()
        rect.x = textNode.absoluteRenderBounds.x
        rect.y = textNode.absoluteRenderBounds.y
        rect.resize(
          textNode.absoluteRenderBounds.width,
          textNode.absoluteRenderBounds.height,
        )

        // Если найден соответствующий keyValue, заливаем прямоугольник синим
        if (matchedKeyValue) {
          rect.fills = [figma.util.solidPaint({ r: 0, g: 0, b: 1, a: 0.3 })]
          rect.name = `⭕️ ${textNode.name}`
          // Добавляем прямоугольник в массив correctRectNodes
          correctRectNodes.push(rect)
        }
        // Если соответствующий keyValue не найден, заливаем прямоугольник красным
        else {
          rect.fills = [figma.util.solidPaint({ r: 1, g: 0, b: 0, a: 0.3 })]
          rect.name = `❌ ${textNode.name}`
          // Добавляем прямоугольник в массив incorrectRectNodes
          incorrectRectNodes.push(rect)
        }
      }
    }),
  )

  // Объединяем correctRectNodes и incorrectRectNodes в rectNodes
  rectNodes = [...correctRectNodes, ...incorrectRectNodes]
  console.log('rectNodes', rectNodes)

  if (rectNodes.length > 0) {
    // Если есть прямоугольники, группируем их
    const group = figma.group(rectNodes, figma.currentPage)

    // Переименовываем группу
    group.name = `${rectNodes.length} Highlights (⭕️ ${correctRectNodes.length} / ❌ ${incorrectRectNodes.length}) - Generated with Sync Text with Notion`

    // Блокируем группу
    group.locked = true

    // Сворачиваем группу
    group.expanded = false

    // Сохраняем id созданной группы в плагинных данных страницы
    pageNode.setPluginData(GROUP_ID_KEY, group.id)
  }
}

// Основная функция подсветки текста
export default async function highlightText(
  keyValues: NotionKeyValue[],
  options: {
    targetTextRange: TargetTextRange
    includeComponents: boolean
    includeInstances: boolean
  },
) {
  console.log('highlightText', keyValues, options)

  // Обрабатываем в зависимости от targetTextRange
  if (options.targetTextRange === 'allPages') {
    for (const page of figma.root.children) {
      // Переходим на целевую страницу
      await figma.setCurrentPageAsync(page)

      // Получаем текстовые узлы на этой странице
      const textNodes = await getTextNodes({
        targetTextRange: 'currentPage',
        includeComponents: options.includeComponents,
        includeInstances: options.includeInstances,
      })

      // Выполняем подсветку
      await createHighlightRectOnPage(keyValues, textNodes, page)
    }
  } else {
    // Получаем текстовые узлы на основе targetTextRange
    const textNodes = await getTextNodes(options)

    // Выполняем подсветку
    await createHighlightRectOnPage(keyValues, textNodes, figma.currentPage)
  }

  // Отображаем уведомление о завершении
  figma.notify(i18n.t('notifications.highlightText.finish'))
}