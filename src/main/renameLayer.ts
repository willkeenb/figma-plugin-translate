import { loadFontsAsync } from '@create-figma-plugin/utilities'

import i18n from '@/i18n/main'
import { getTextNodes } from '@/main/util'

import type { NotionKeyValue, TargetTextRange } from '@/types/common'

export default async function renameLayer(
  keyValues: NotionKeyValue[],
  options: {
    targetTextRange: TargetTextRange
    includeComponents: boolean
    includeInstances: boolean
  },
) {
  console.log('renameLayer', keyValues, options)

  const textNodes = await getTextNodes(options)

  console.log('textNodes', textNodes)

  if (textNodes.length === 0) {
    if (options.targetTextRange === 'selection') {
      figma.notify(i18n.t('notifications.main.noTextInSelection'))
    } else if (options.targetTextRange === 'currentPage') {
      figma.notify(i18n.t('notifications.main.noTextInCurrentPage'))
    } else if (options.targetTextRange === 'allPages') {
      figma.notify(i18n.t('notifications.main.noTextInAllPages'))
    }
    return
  }

  await loadFontsAsync(textNodes).catch((error: Error) => {
    const errorMessage = i18n.t('notifications.main.errorLoadFonts')
    figma.notify(errorMessage, { error: true })
    throw new Error(errorMessage)
  })

  const valueRuKeyMap = new Map(
    keyValues.map(keyValue => [keyValue.valueRu, keyValue]),
  )
  const valueUzKeyMap = new Map(
    keyValues.map(keyValue => [keyValue.valueUz, keyValue]),
  )

  textNodes.forEach(textNode => {
    const matchedKeyValueRu = valueRuKeyMap.get(textNode.characters)
    const matchedKeyValueUz = valueUzKeyMap.get(textNode.characters)

    if (matchedKeyValueRu) {
      console.log('matchedKeyValueRu exist', textNode.characters, matchedKeyValueRu)
      textNode.name = `#${matchedKeyValueRu.key}`
    } else if (matchedKeyValueUz) {
      console.log('matchedKeyValueUz exist', textNode.characters, matchedKeyValueUz)
      textNode.name = `#${matchedKeyValueUz.key}`
    } else {
      console.log('no matchedKeyValue', textNode.characters)
    }
  })

  figma.notify(i18n.t('notifications.renameLayer.finish'))
}