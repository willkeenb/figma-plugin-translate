import type { defaultNS, resources } from '@/ui/i18n'

// Расширение типов для библиотеки i18next
declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false
    resources: (typeof resources)['en']
  }
}

// Определение типа для функции перевода
export type TFunction = {
  (key: string | string[]): string;
  <T extends Record<string, unknown>>(key: string | string[], options: T): string;
};