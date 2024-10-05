import { create } from 'zustand'

import { DEFAULT_OPTIONS } from '@/constants'
import type { NotionKeyValue, Options } from '@/types/common'

// Создание основного хранилища состояния с использованием Zustand
// Инициализируется значениями по умолчанию из DEFAULT_OPTIONS
export const useStore = create<Options>(set => DEFAULT_OPTIONS)

// Создание отдельного хранилища для хранения пар ключ-значение из Notion
// Инициализируется пустым массивом keyValues
export const useKeyValuesStore = create<{ keyValues: NotionKeyValue[] }>(
  set => ({
    keyValues: [],
  }),
)