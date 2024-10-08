import { emit } from '@create-figma-plugin/utilities'
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@/constants'
import type { ResizeWindowHandler } from '@/types/eventHandler'

export default function useResizeWindow() {
  // Обновляем тип параметра options
  function resizeWindow(options?: {
  width?: number
  height?: number // Добавляем height в тип
  delay?: number
}, p0?: string) {
    window.setTimeout(() => {
      const wrapper = document.getElementById('wrapper')
      // Используем переданную высоту или высоту wrapper, если она не указана
      const width = options?.width !== undefined ? options.width : (wrapper?.clientWidth || 0)
      const height = options?.height !== undefined ? options.height : (wrapper?.clientHeight || 0)

      console.log('resizeWindow', options, wrapper, width, height)

      emit<ResizeWindowHandler>('RESIZE_WINDOW', {
        width: options?.width || DEFAULT_WIDTH,
        height: options?.width || DEFAULT_HEIGHT,
      })
    }, options?.delay || 1)
  }

  return { resizeWindow }
}