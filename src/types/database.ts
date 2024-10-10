import type { DatabaseOptionId, ValuePropertyName } from '@/constants'

export type { DatabaseOptionId, ValuePropertyName }
export type DatabaseOption = {
  id: DatabaseOptionId
  name: string
}
export type DatabaseOptions = DatabaseOption[]