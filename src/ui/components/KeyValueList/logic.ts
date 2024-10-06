import { useCallback, useState } from 'preact/hooks'
import { useDebounce, useMount, useUnmount, useUpdateEffect } from 'react-use'
import { useStore } from '@/ui/Store'
import useOptions from '@/ui/hooks/useOptions'

export function useKeyValueListLogic(initialScrollPosition: number) {
  const options = useStore()
  const { updateOptions } = useOptions()
  const [tmpScrollPosition, setTmpScrollPosition] = useState(0)
  const [scrollPositionRestored, setScrollPositionRestored] = useState(false)

  const handleRowClick = useCallback(
    (id: string) => {
      console.log('handleRowClick', id, options.selectedRowId)
      if (id !== options.selectedRowId) {
        updateOptions({ selectedRowId: id })
      } else {
        updateOptions({ selectedRowId: null })
      }
    },
    [options.selectedRowId, updateOptions],
  )

  const handleScroll = useCallback(() => {
    setTmpScrollPosition(prevPosition => prevPosition)
  }, [])

  useDebounce(
    () => {
      if (scrollPositionRestored) {
        console.log('scrollPosition update (debounced)', tmpScrollPosition)
        updateOptions({ scrollPosition: tmpScrollPosition })
      }
    },
    100,
    [tmpScrollPosition, scrollPositionRestored, updateOptions],
  )

  useMount(() => {
    console.log('KeyValueList mounted')
  })

  useUnmount(() => {
    console.log('KeyValueList unmounted')
  })

  useUpdateEffect(() => {
    console.log(
      'rows updated',
      `scrollPositionRestored: ${scrollPositionRestored}`,
    )

    if (!scrollPositionRestored) {
      console.log('restore scroll position', initialScrollPosition)
      setTmpScrollPosition(initialScrollPosition)
      setScrollPositionRestored(true)
    } else {
      console.log('reset scroll position to top')
      setTmpScrollPosition(0)
    }
  }, [initialScrollPosition, scrollPositionRestored])

  return {
    handleRowClick,
    handleScroll,
    tmpScrollPosition,
    scrollPositionRestored,
    setScrollPositionRestored,
  }
}