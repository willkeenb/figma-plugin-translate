import type { NotionKeyValue } from '@/types/common'

export default function useNotionKeyValue() {
  /**
   * Функция для получения ключа с параметрами запроса
   * @param {NotionKeyValue} keyValue - Объект, содержащий ключ и значения из Notion
   * @param {'ru' | 'uz'} language - Язык, для которого нужно извлечь параметры
   * @returns {string} Строка, содержащая ключ и параметры запроса (если есть)
   */
  function getKeyWithQueryStrings(keyValue: NotionKeyValue, language: 'ru' | 'uz'): string {
    const value = language === 'ru' ? keyValue.valueRu : keyValue.valueUz

    // Извлекаем параметры, заключенные в фигурные скобки
    const params: string[] =
      value.match(/\{([^}]+)\}/g)?.map(param => param.slice(1, -1)) ||
      []

    // Если параметры существуют, генерируем строку запроса
    if (params.length > 0) {
      const queryString: string = params.map(param => `${param}=${param}`).join('&')
      return `#${keyValue.key}?lang=${language}&${queryString}`
    }

    // Если параметров нет, возвращаем ключ с указанием языка
    return `#${keyValue.key}?lang=${language}`
  }

  /**
   * Функция для получения всех уникальных параметров из обоих языковых значений
   * @param {NotionKeyValue} keyValue - Объект, содержащий ключ и значения из Notion
   * @returns {string[]} Массив уникальных параметров
   */
  function getAllParams(keyValue: NotionKeyValue): string[] {
    const ruParams = keyValue.valueRu.match(/\{([^}]+)\}/g)?.map(param => param.slice(1, -1)) || []
    const uzParams = keyValue.valueUz.match(/\{([^}]+)\}/g)?.map(param => param.slice(1, -1)) || []
    
    return Array.from(new Set([...ruParams, ...uzParams]))
  }

  /**
   * Функция для получения ключа со всеми возможными параметрами запроса
   * @param {NotionKeyValue} keyValue - Объект, содержащий ключ и значения из Notion
   * @returns {string} Строка, содержащая ключ и все возможные параметры запроса
   */
  function getKeyWithAllQueryStrings(keyValue: NotionKeyValue): string {
    const allParams = getAllParams(keyValue)

    if (allParams.length > 0) {
      const queryString: string = allParams.map(param => `${param}=${param}`).join('&')
      return `#${keyValue.key}?lang={ru|uz}&${queryString}`
    }

    return `#${keyValue.key}?lang={ru|uz}`
  }

  // Возвращаем объект с функциями для использования в компонентах
  return { 
    getKeyWithQueryStrings,
    getAllParams,
    getKeyWithAllQueryStrings
  }
}