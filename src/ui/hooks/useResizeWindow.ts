import { emit } from '@create-figma-plugin/utilities'

import { DEFAULT_WIDTH } from '@/constants'

import type { ResizeWindowHandler } from '@/types/eventHandler'

export default function useResizeWindow() {
  // Функция для изменения размера окна плагина
  function resizeWindow(options?: {
    width?: number
    delay?: number
  }) {
    // Устанавливаем таймаут для выполнения изменения размера
    window.setTimeout(() => {
      // Находим элемент с id 'wrapper'
      const wrapper = document.getElementById('wrapper')
      // Получаем высоту элемента wrapper или 0, если элемент не найден
      const height = wrapper?.clientHeight || 0

      console.log('resizeWindow', options, wrapper, height)

      // Отправляем событие для изменения размера окна
      emit<ResizeWindowHandler>('RESIZE_WINDOW', {
        // Используем переданную ширину или DEFAULT_WIDTH, если ширина не указана
        width: options?.width || DEFAULT_WIDTH,
        height,
      })
    }, options?.delay || 1) // Используем переданную задержку или 16мс по умолчанию
  }

  // Возвращаем объект с функцией resizeWindow
  return { resizeWindow }
}