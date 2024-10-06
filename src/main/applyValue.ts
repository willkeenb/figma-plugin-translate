import { loadFontsAsync } from '@create-figma-plugin/utilities'
import queryString, { type ParsedQuery } from 'query-string'

import i18n from '@/i18n/main'
import { getTextNodes } from '@/main/util'

import type { NotionKeyValue, TargetTextRange } from '@/types/common'

export default async function applyValue(
  keyValues: NotionKeyValue[],
  options: {
    targetTextRange: TargetTextRange
    includeComponents: boolean
    includeInstances: boolean
  },
) {
  console.log('applyValue', keyValues, options)

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

  let matchedTextNodes: TextNode[] = []

  matchedTextNodes = textNodes.filter(textNode => {
    return textNode.name.startsWith('#')
  })

  console.log('matchedTextNodes', matchedTextNodes)

  if (matchedTextNodes.length === 0) {
    figma.notify(i18n.t('notifications.applyValue.noMatchingText'))
    return
  }

  await loadFontsAsync(matchedTextNodes).catch((error: Error) => {
    const errorMessage = i18n.t('notifications.main.errorLoadFonts')
    figma.notify(errorMessage, { error: true })
    throw new Error(errorMessage)
  })

  matchedTextNodes.forEach(textNode => {
    const originalParam = textNode.name.split('?')[1] as string | undefined
    let param: ParsedQuery<string>
    if (originalParam) {
      const replacedParam = originalParam.replace(/\+/g, '%2B')
      param = queryString.parse(replacedParam)
    } else {
      param = queryString.parse('')
    }

    const key = textNode.name.split('?')[0].replace(/^#/, '')

    const keyValue = keyValues.find(keyValue => {
      return keyValue.key === key
    })

    if (keyValue) {
      console.log('keyValue found', key)

      const value = param.lang === 'uz' ? keyValue.valueUz : keyValue.valueRu

      console.log('value', value)
      console.log('param', param)

      if (Object.keys(param).length) {
        const matchedParamKeys = value.match(/(?<=\{).*?(?=\})/g)

        if (!matchedParamKeys) {
          textNode.characters = value
          return
        }

        let replacedValue = value
        matchedParamKeys.forEach(paramKey => {
          replacedValue = replacedValue.replace(
            new RegExp(`{${paramKey}}`, 'g'),
            param[paramKey] !== undefined
              ? String(param[paramKey])
              : `{${paramKey}}`,
          )
        })

        textNode.characters = replacedValue
      } else {
        textNode.characters = value
      }
    } else {
      console.log('keyValue not found', key)
    }
  })

  if (options.targetTextRange === 'selection') {
    figma.notify(i18n.t('notifications.applyValue.finishSelection'))
  } else if (options.targetTextRange === 'currentPage') {
    figma.notify(i18n.t('notifications.applyValue.finishCurrentPage'))
  } else if (options.targetTextRange === 'allPages') {
    figma.notify(i18n.t('notifications.applyValue.finishAllPages'))
  }
}