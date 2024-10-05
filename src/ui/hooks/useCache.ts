import { emit, once } from '@create-figma-plugin/utilities'

import { useKeyValuesStore } from '@/ui/Store'

import type { NotionKeyValue } from '@/types/common'
import type {
  LoadCacheFromMainHandler,
  LoadCacheFromUIHandler,
  SaveCacheHandler,
} from '@/types/eventHandler'

export default function useCache() {
  // Функция для загрузки кэша из документа
  function loadCacheFromDocument() {
    return new Promise<NotionKeyValue[]>(resolve => {
      console.log('loadCacheFromDocument')

      // Устанавливаем одноразовый обработчик события 'LOAD_CACHE_FROM_MAIN'
      once<LoadCacheFromMainHandler>('LOAD_CACHE_FROM_MAIN', keyValues => {
        console.log('cached keyValues', keyValues)
        // Обновляем состояние хранилища ключ-значений
        useKeyValuesStore.setState({ keyValues })
        resolve(keyValues)
      })

      // Отправляем событие для запроса кэша из основной части плагина
      emit<LoadCacheFromUIHandler>('LOAD_CACHE_FROM_UI')
    })
  }

  // Функция для сохранения кэша в документ
  function saveCacheToDocument(keyValues: NotionKeyValue[]) {
    console.log('saveCacheToDocument', keyValues)
    // Отправляем событие для сохранения кэша в основной части плагина
    emit<SaveCacheHandler>('SAVE_CACHE', keyValues)
  }

  // Возвращаем объект с функциями для работы с кэшем
  return { loadCacheFromDocument, saveCacheToDocument }
}