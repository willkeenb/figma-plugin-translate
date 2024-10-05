import { loadFontsAsync } from '@create-figma-plugin/utilities'

import i18n from '@/i18n/main'

import type { NotionKeyValue } from '@/types/common'

export default async function applyKeyValue(keyValue: NotionKeyValue) {
  console.log('applyKeyValue', keyValue)

  // Если ничего не выбрано, завершаем выполнение
  if (figma.currentPage.selection.length === 0) {
    figma.notify(i18n.t('notifications.main.noSelections'))
    return
  }

  // Массив для хранения текстовых узлов
  const textNodes: TextNode[] = []

  // Обрабатываем каждый выбранный элемент
  figma.currentPage.selection.forEach(node => {
    // Если элемент является текстовым, добавляем его в textNodes
    if (node.type === 'TEXT') {
      textNodes.push(node)
    }
  })

  console.log('textNodes', textNodes)

  // Если текстовых узлов нет, прерываем выполнение
  if (textNodes.length === 0) {
    figma.notify(i18n.t('notifications.main.noTextInSelection'))
    return
  }

  // Предварительно загружаем шрифты
  await loadFontsAsync(textNodes).catch((error: Error) => {
    const errorMessage = i18n.t('notifications.main.errorLoadFonts')
    figma.notify(errorMessage, { error: true })
    throw new Error(errorMessage)
  })

  // Обрабатываем каждый текстовый узел
  textNodes.forEach(textNode => {
    // Устанавливаем имя слоя как ключ
    // На стороне UI это обрабатывается как `#${keyValue.key}?${queryString}`
    textNode.name = keyValue.key

    // Устанавливаем текст узла как значение
    textNode.characters = keyValue.value
  })

  // Отображаем уведомление о завершении
  figma.notify(i18n.t('notifications.applyKeyValue.finish'))
}