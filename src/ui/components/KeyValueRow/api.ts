import useNotionKeyValue from '@/ui/hooks/useNotionKeyValue'

export function useKeyValueApi() {
  const { getKeyWithQueryStrings } = useNotionKeyValue()

  const handleOpenInBrowser = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return {
    getKeyWithQueryStrings,
    handleOpenInBrowser
  }
}