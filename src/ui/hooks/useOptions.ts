import { emit, once } from '@create-figma-plugin/utilities'

import { useStore } from '@/ui/Store'

import type { Options } from '@/types/common'
import type {
  LoadOptionsFromMainHandler,
  LoadOptionsFromUIHandler,
  SaveOptionsHandler,
} from '@/types/eventHandler'

export default function useOptions(isApp?: boolean) {
  // Функция для обновления опций в хранилище
  function updateOptions(keyValue: { [T in keyof Options]?: Options[T] }) {
    console.log('updateOptions', {
      ...useStore.getState(),
      ...keyValue,
    })

    // Обновляем состояние хранилища
    useStore.setState({ ...useStore.getState(), ...keyValue })
  }

  // Функция для загрузки опций из клиентского хранилища
  function loadOptionsFromClientStorage() {
    return new Promise<Options>(resolve => {
      console.log('loadOptionsFromClientStorage')

      // Устанавливаем одноразовый обработчик события 'LOAD_OPTIONS_FROM_MAIN'
      once<LoadOptionsFromMainHandler>(
        'LOAD_OPTIONS_FROM_MAIN',
        (options: Options) => {
          updateOptions(options)
          resolve(options)
        },
      )

      // Отправляем событие для запроса опций из основной части плагина
      emit<LoadOptionsFromUIHandler>('LOAD_OPTIONS_FROM_UI')
    })
  }

  // Функция для сохранения опций в клиентское хранилище
  function saveOptionsToClientStorage(options: Options) {
    console.log('saveOptionsToClientStorage', options)
    // Отправляем событие для сохранения опций в основной части плагина
    emit<SaveOptionsHandler>('SAVE_OPTIONS', options)
  }

  // Возвращаем объект с функциями для работы с опциями
  return {
    updateOptions,
    loadOptionsFromClientStorage,
    saveOptionsToClientStorage,
  }
}