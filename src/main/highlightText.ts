import { GROUP_ID_KEY } from '@/constants'
import i18n from '@/i18n/main'
import { getTextNodes } from '@/main/util'

import type { NotionKeyValue, TargetTextRange } from '@/types/common'

async function createHighlightRectOnPage(
  keyValues: NotionKeyValue[],
  textNodes: TextNode[],
  pageNode: PageNode,
) {
  console.log('createHighlightRectOnPage', textNodes, pageNode)

  let correctLayerNameFormatTextNodes: TextNode[] = []
  let rectNodes: RectangleNode[] = []
  const correctRectNodes: RectangleNode[] = []
  const incorrectRectNodes: RectangleNode[] = []

  correctLayerNameFormatTextNodes = textNodes.filter(textNode => {
    console.log(textNode.name)
    return textNode.name.startsWith('#')
  })

  console.log(
    'correctLayerNameFormatTextNodes',
    correctLayerNameFormatTextNodes,
  )

  if (correctLayerNameFormatTextNodes.length === 0) {
    console.log('no matched text')
    return
  }

  const generatedGroupId = pageNode.getPluginData(GROUP_ID_KEY)
  const previousGeneratedGroup = pageNode.findOne(
    node => node.id === generatedGroupId,
  ) as GroupNode | null
  console.log('generatedGroupId', generatedGroupId)
  console.log('previousGeneratedGroup', previousGeneratedGroup)
  if (previousGeneratedGroup) {
    previousGeneratedGroup.remove()
  }

  await Promise.all(
    correctLayerNameFormatTextNodes.map(async textNode => {
      const key = textNode.name.split('?')[0].replace(/^#/, '')

      const matchedKeyValue = keyValues.find(keyValue => {
        return keyValue.key === key
      })

      if (textNode.absoluteRenderBounds) {
        const rect = figma.createRectangle()
        rect.x = textNode.absoluteRenderBounds.x
        rect.y = textNode.absoluteRenderBounds.y
        rect.resize(
          textNode.absoluteRenderBounds.width,
          textNode.absoluteRenderBounds.height,
        )

        if (matchedKeyValue && 
            (textNode.characters === matchedKeyValue.valueRu || 
             textNode.characters === matchedKeyValue.valueUz)) {
          rect.fills = [figma.util.solidPaint({ r: 0, g: 0, b: 1, a: 0.3 })]
          rect.name = `⭕️ ${textNode.name}`
          correctRectNodes.push(rect)
        } else {
          rect.fills = [figma.util.solidPaint({ r: 1, g: 0, b: 0, a: 0.3 })]
          rect.name = `❌ ${textNode.name}`
          incorrectRectNodes.push(rect)
        }
      }
    }),
  )

  rectNodes = [...correctRectNodes, ...incorrectRectNodes]
  console.log('rectNodes', rectNodes)

  if (rectNodes.length > 0) {
    const group = figma.group(rectNodes, figma.currentPage)
    group.name = `${rectNodes.length} Highlights (⭕️ ${correctRectNodes.length} / ❌ ${incorrectRectNodes.length}) - Generated with Sync Text with Notion`
    group.locked = true
    group.expanded = false
    pageNode.setPluginData(GROUP_ID_KEY, group.id)
  }
}

export default async function highlightText(
  keyValues: NotionKeyValue[],
  options: {
    targetTextRange: TargetTextRange
    includeComponents: boolean
    includeInstances: boolean
  },
) {
  console.log('highlightText', keyValues, options)

  if (options.targetTextRange === 'allPages') {
    for (const page of figma.root.children) {
      await figma.setCurrentPageAsync(page)
      const textNodes = await getTextNodes({
        targetTextRange: 'currentPage',
        includeComponents: options.includeComponents,
        includeInstances: options.includeInstances,
      })
      await createHighlightRectOnPage(keyValues, textNodes, page)
    }
  } else {
    const textNodes = await getTextNodes(options)
    await createHighlightRectOnPage(keyValues, textNodes, figma.currentPage)
  }

  figma.notify(i18n.t('notifications.highlightText.finish'))
}