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

  // Получаем текстовые узлы
  const textNodes = await getTextNodes(options)

  console.log('textNodes', textNodes)

  // Если текстовых узлов нет, завершаем выполнение
  if (textNodes.length === 0) {
    // Отображаем уведомление в зависимости от выбранного диапазона
    if (options.targetTextRange === 'selection') {
      figma.notify(i18n.t('notifications.main.noTextInSelection'))
    } else if (options.targetTextRange === 'currentPage') {
      figma.notify(i18n.t('notifications.main.noTextInCurrentPage'))
    } else if (options.targetTextRange === 'allPages') {
      figma.notify(i18n.t('notifications.main.noTextInAllPages'))
    }

    return
  }

  // Массив для хранения подходящих текстовых узлов
  let matchedTextNodes: TextNode[] = []

  // Фильтруем текстовые узлы, оставляя только те, чье имя начинается с #
  matchedTextNodes = textNodes.filter(textNode => {
    return textNode.name.startsWith('#')
  })

  console.log('matchedTextNodes', matchedTextNodes)

  // Если нет подходящих текстовых узлов, завершаем выполнение
  if (matchedTextNodes.length === 0) {
    figma.notify(i18n.t('notifications.applyValue.noMatchingText'))
    return
  }

  // Предварительно загружаем шрифты
  await loadFontsAsync(matchedTextNodes).catch((error: Error) => {
    const errorMessage = i18n.t('notifications.main.errorLoadFonts')
    figma.notify(errorMessage, { error: true })
    throw new Error(errorMessage)
  })

  // Обрабатываем каждый подходящий текстовый узел
  matchedTextNodes.forEach(textNode => {
    // Получаем параметры запроса из имени слоя
    const originalParam = textNode.name.split('?')[1] as string | undefined
    let param: ParsedQuery<string>
    if (originalParam) {
      const replacedParam = originalParam.replace(/\+/g, '%2B')
      param = queryString.parse(replacedParam)
    } else {
      param = queryString.parse('')
    }

    // Извлекаем ключ из имени слоя
    const key = textNode.name.split('?')[0].replace(/^#/, '')

    // Ищем соответствующий объект в keyValues
    const keyValue = keyValues.find(keyValue => {
      return keyValue.key === key
    })

    // Заменяем текст
    if (keyValue) {
      console.log('keyValue found', key)

      const value = keyValue.value

      console.log('value', value)
      console.log('param', param)

      // Если есть параметры, пытаемся заменить {paramKey} в value
      if (Object.keys(param).length) {
        const matchedParamKeys = value.match(/(?<=\{).*?(?=\})/g)

        if (!matchedParamKeys) {
          textNode.characters = value
          return
        }

        // Заменяем каждый {paramKey} в value
        let replacedValue = value
        matchedParamKeys.forEach(paramKey => {
          replacedValue = replacedValue.replace(
            new RegExp(`{${paramKey}}`, 'g'),
            param[paramKey] !== undefined
              ? String(param[paramKey])
              : `{${paramKey}}`,
          )
        })

        // Устанавливаем заменённое значение как текст узла
        textNode.characters = replacedValue
      }
      // Если параметров нет, просто устанавливаем value как текст узла
      else {
        textNode.characters = value
      }
    }
    // Если соответствующий keyValue не найден
    else {
      console.log('keyValue not found', key)
    }
  })

  // Отображаем уведомление о завершении
  if (options.targetTextRange === 'selection') {
    figma.notify(i18n.t('notifications.applyValue.finishSelection'))
  } else if (options.targetTextRange === 'currentPage') {
    figma.notify(i18n.t('notifications.applyValue.finishCurrentPage'))
  } else if (options.targetTextRange === 'allPages') {
    figma.notify(i18n.t('notifications.applyValue.finishAllPages'))
  }
}