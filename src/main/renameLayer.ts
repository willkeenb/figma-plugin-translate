import { loadFontsAsync } from '@create-figma-plugin/utilities'

import i18n from '@/i18n/main'
import { getTextNodes } from '@/main/util'

import type { NotionKeyValue, TargetTextRange } from '@/types/common'

// Функция для переименования слоев
export default async function renameLayer(
  keyValues: NotionKeyValue[],
  options: {
    targetTextRange: TargetTextRange
    includeComponents: boolean
    includeInstances: boolean
  },
) {
  console.log('renameLayer', keyValues, options)

  // Получение текстовых узлов
  const textNodes = await getTextNodes(options)

  console.log('textNodes', textNodes)

  // Если текстовых узлов нет, завершаем выполнение
  if (textNodes.length === 0) {
    // Отображение уведомления в зависимости от выбранного диапазона
    if (options.targetTextRange === 'selection') {
      figma.notify(i18n.t('notifications.main.noTextInSelection'))
    } else if (options.targetTextRange === 'currentPage') {
      figma.notify(i18n.t('notifications.main.noTextInCurrentPage'))
    } else if (options.targetTextRange === 'allPages') {
      figma.notify(i18n.t('notifications.main.noTextInAllPages'))
    }

    return
  }

  // Предварительная загрузка шрифтов
  await loadFontsAsync(textNodes).catch((error: Error) => {
    const errorMessage = i18n.t('notifications.main.errorLoadFonts')
    figma.notify(errorMessage, { error: true })
    throw new Error(errorMessage)
  })

  // Создание карты, где ключ - значение, а значение - объект KeyValue
  const valueKeyMap = new Map(
    keyValues.map(keyValue => [keyValue.value, keyValue]),
  )

  // Обработка каждого текстового узла
  textNodes.forEach(textNode => {
    // Поиск соответствующего KeyValue для текущего текстового узла
    const matchedKeyValue = valueKeyMap.get(textNode.characters)

    // Если найдено соответствие, переименовываем слой
    if (matchedKeyValue) {
      console.log('matchedKeyValue exist', textNode.characters, matchedKeyValue)
      textNode.name = `#${matchedKeyValue.key}`
    } else {
      console.log('no matchedKeyValue', textNode.characters)
    }
  })

  // Уведомление о завершении
  figma.notify(i18n.t('notifications.renameLayer.finish'))
}