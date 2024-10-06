import { loadFontsAsync } from '@create-figma-plugin/utilities'
import i18n from '@/i18n/main'

import type { NotionKeyValue } from '@/types/common'

export default async function applyKeyValue(keyValue: NotionKeyValue & { value: string }) {
  console.log('applyKeyValue', keyValue)

  if (figma.currentPage.selection.length === 0) {
    figma.notify(i18n.t('notifications.main.noSelections'))
    return
  }

  const textNodes: TextNode[] = []

  figma.currentPage.selection.forEach(node => {
    if (node.type === 'TEXT') {
      textNodes.push(node)
    }
  })

  if (textNodes.length === 0) {
    figma.notify(i18n.t('notifications.main.noTextInSelection'))
    return
  }

  await loadFontsAsync(textNodes).catch((error: Error) => {
    const errorMessage = i18n.t('notifications.main.errorLoadFonts')
    figma.notify(errorMessage, { error: true })
    throw new Error(errorMessage)
  })

  textNodes.forEach(textNode => {
    textNode.name = `#${keyValue.key}`
    textNode.characters = keyValue.value
  })

  figma.notify(i18n.t('notifications.applyKeyValue.finish'))
}