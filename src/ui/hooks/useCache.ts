import { emit, on } from '@create-figma-plugin/utilities'
import { useCallback } from 'preact/hooks'
import type { NotionKeyValue } from '@/types/common'
import type { LoadCacheFromUIHandler, LoadCacheFromMainHandler, SaveCacheHandler } from '@/types/eventHandler'

interface CacheFunctions {
  loadCacheFromDocument: () => Promise<void>
  saveCacheToDocument: (keyValues: NotionKeyValue[]) => void
}

const useCache = (): CacheFunctions => {
  const loadCacheFromDocument = useCallback(() => {
    return new Promise<void>((resolve) => {
      emit<LoadCacheFromUIHandler>('LOAD_CACHE_FROM_UI')
      on<LoadCacheFromMainHandler>('LOAD_CACHE_FROM_MAIN', (cache) => {
        // Здесь вы можете обновить состояние вашего приложения с полученным кэшем
        resolve()
      })
    })
  }, [])

  const saveCacheToDocument = useCallback((keyValues: NotionKeyValue[]) => {
    emit<SaveCacheHandler>('SAVE_CACHE', keyValues)
  }, [])

  return {
    loadCacheFromDocument,
    saveCacheToDocument
  }
}

export default useCache