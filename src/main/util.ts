import times from 'lodash/times'
import uniqBy from 'lodash/uniqBy'

import i18n from '@/i18n/main'

import type { TargetTextRange } from '@/types/common'

// Рекурсивная функция, проверяющая, является ли родитель узла компонентом или вариантом
export function getIsNodeParentComponentOrVariants(node: SceneNode) {
  // Если нет родителя, возвращаем false
  if (!node.parent) {
    return false
  }
  // Если родитель - страница или документ, возвращаем false
  if (node.parent.type === 'PAGE' || node.parent.type === 'DOCUMENT') {
    return false
  }
  // Если тип родителя COMPONENT или COMPONENT_SET, возвращаем true
  if (
    node.parent.type === 'COMPONENT' ||
    node.parent.type === 'COMPONENT_SET'
  ) {
    return true
  }
  // Если ни одно из условий не выполнено, рекурсивно вызываем функцию для родителя
  return getIsNodeParentComponentOrVariants(node.parent)
}

// Функция, возвращающая массив предков-экземпляров узла по его id (не включая сам узел)
export function getAncestorInstances(node: SceneNode) {
  const instanceArray: InstanceNode[] = []

  // Разделяем id по точке с запятой
  const idArray = node.id.split(';')

  idArray.map((id, i) => {
    if (i === idArray.length - 1) {
      return
    }

    // Формируем targetId в зависимости от индекса
    let targetId = ''
    if (i === 0) {
      targetId = idArray[i]
    } else {
      const arr: string[] = []
      times(i + 1).map(j => arr.push(idArray[j]))
      targetId = arr.join(';')
    }

    // Ищем экземпляр по сформированному id
    const instance = figma.getNodeById(targetId) as InstanceNode

    instanceArray.push(instance)
  })

  return instanceArray
}

// Функция для фильтрации текстовых узлов
function filterTextNodes(
  textNodes: TextNode[],
  options: {
    includeComponents: boolean
    includeInstances: boolean
  },
) {
  // Массив для хранения текстовых узлов, которые нужно удалить
  let textNodesToRemove: TextNode[] = []

  // Если includeComponents false, добавляем дочерние элементы компонентов или вариантов в textNodesToRemove
  if (!options.includeComponents) {
    textNodes.forEach(textNode => {
      console.log(
        'Checking textNode is component/variant child:',
        textNode.characters,
      )

      if (getIsNodeParentComponentOrVariants(textNode)) {
        console.log(
          'Removing textNode is component/variant child:',
          textNode.characters,
        )
        textNodesToRemove.push(textNode)
      }
    })
  }

  // Если includeInstances false, добавляем дочерние элементы экземпляров в textNodesToRemove
  if (!options.includeInstances) {
    console.log('textNodes', textNodes)
    textNodes.forEach(textNode => {
      console.log('Checking textNode is instance child:', textNode.characters)

      const ancestorInstances = getAncestorInstances(textNode)
      if (ancestorInstances.length > 0) {
        console.log('Removing textNode is instance child:', textNode.characters)
        textNodesToRemove.push(textNode)
      }
    })
  }

  // Удаляем дубликаты из textNodesToRemove
  textNodesToRemove = uniqBy(textNodesToRemove, 'id')

  console.log('textNodesToRemove', textNodesToRemove)

  // Удаляем элементы из textNodes, которые есть в textNodesToRemove
  const filteredTextNodes = textNodes.filter(textNode => {
    return !textNodesToRemove.some(
      textNodeToRemove => textNodeToRemove.id === textNode.id,
    )
  })

  // Возвращаем отфильтрованные текстовые узлы
  return filteredTextNodes
}

// Функция для получения текстовых узлов в зависимости от targetTextRange
export async function getTextNodes(options: {
  targetTextRange: TargetTextRange
  includeComponents: boolean
  includeInstances: boolean
}) {
  console.log('getTextNodes', options.targetTextRange, options)

  // Массив для хранения текстовых узлов
  let textNodes: TextNode[] = []

  if (options.targetTextRange === 'currentPage') {
    // Загружаем текущую страницу
    await figma.currentPage.loadAsync()

    // Ищем все текстовые узлы на текущей странице
    textNodes = figma.currentPage.findAllWithCriteria({ types: ['TEXT'] })
  } else if (options.targetTextRange === 'allPages') {
    // Обрабатываем каждую страницу
    for (const page of figma.root.children) {
      // Загружаем страницу
      await page.loadAsync()

      // Добавляем все текстовые узлы со страницы в textNodes
      textNodes = [
        ...textNodes,
        ...page.findAllWithCriteria({ types: ['TEXT'] }),
      ]
    }
  } else if (options.targetTextRange === 'selection') {
    // Если ничего не выбрано, завершаем выполнение
    if (figma.currentPage.selection.length === 0) {
      figma.notify(i18n.t('notifications.main.noSelections'))
      return textNodes
    }

    figma.currentPage.selection.forEach(node => {
      // Если узел - текст, добавляем его в textNodes
      if (node.type === 'TEXT') {
        textNodes.push(node)
      }

      // Если узел - группа, фрейм, компонент, набор компонентов или экземпляр, добавляем все текстовые узлы внутри него
      else if (
        node.type === 'GROUP' ||
        node.type === 'FRAME' ||
        node.type === 'COMPONENT' ||
        node.type === 'COMPONENT_SET' ||
        node.type === 'INSTANCE'
      ) {
        textNodes = [
          ...textNodes,
          ...node.findAllWithCriteria({ types: ['TEXT'] }),
        ]
      }

      // Для остальных типов узлов ничего не делаем
      // else {}
    })
  }

  // Если includeComponents или includeInstances false, фильтруем текстовые узлы
  if (!options.includeComponents || !options.includeInstances) {
    textNodes = filterTextNodes(textNodes, {
      includeComponents: options.includeComponents,
      includeInstances: options.includeInstances,
    })
  }

  return textNodes
}