import type { NotionKeyValue } from '@/types/common'

export default function useNotionKeyValue() {
  /**
   * Функция для получения ключа с параметрами запроса
   * @param {NotionKeyValue} keyValue - Объект, содержащий ключ и значение из Notion
   * @returns {string} Строка, содержащая ключ и параметры запроса (если есть)
   */
  function getKeyWithQueryStrings(keyValue: NotionKeyValue): string {
    // Извлекаем параметры, заключенные в фигурные скобки
    const params: string[] =
      keyValue.value.match(/\{([^}]+)\}/g)?.map(param => param.slice(1, -1)) ||
      []

    // Если параметры существуют, генерируем строку запроса
    if (params.length > 0) {
      const queryString: string = params.map(param => `${param}=${param}`).join('&')
      return `#${keyValue.key}?${queryString}`
    }

    // Если параметров нет, возвращаем только ключ
    return `#${keyValue.key}`
  }

  // Возвращаем объект с функцией для использования в компонентах
  return { getKeyWithQueryStrings }
}