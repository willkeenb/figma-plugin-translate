/** @jsx h */
import { h, Fragment } from 'preact'
import { useEffect } from 'preact/hooks'

interface StyleObject {
  [key: string]: string
}

interface StyleConfig {
  selector: string
  styles?: StyleObject
  classNames?: string[]
}

interface RootStylerProps {
  children: preact.ComponentChildren
}

export function RootStyler({ children }: RootStylerProps) {
  const styleConfigs: StyleConfig[] = [
    {
      selector: '.theme-figma',
      styles: { height: '100%', overflow: 'hidden' }
    },
    // {
    //   selector: '.navigation-tabs',
    //   styles: { backgroundColor: '#f0f0f0' },
    //   classNames: ['custom-tabs']
    // },
    // Добавьте здесь другие конфигурации по необходимости
  ]

  useEffect(() => {
    const appliedStyles: { element: Element; styles: StyleObject; classNames: string[] }[] = []

    styleConfigs.forEach(({ selector, styles = {}, classNames = [] }) => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
        if (element instanceof HTMLElement) {
          Object.assign(element.style, styles)
          classNames.forEach(className => element.classList.add(className))
          appliedStyles.push({ element, styles, classNames })
        }
      })
    })

    // Функция очистки
    return () => {
      appliedStyles.forEach(({ element, styles, classNames }) => {
        if (element instanceof HTMLElement) {
          // Удаляем добавленные стили
          Object.keys(styles).forEach(key => {
            element.style.removeProperty(key)
          })
          // Удаляем добавленные классы
          classNames.forEach(className => element.classList.remove(className))
        }
      })
    }
  }, []) // Пустой массив зависимостей, так как конфигурация статична

  return <>{children}</>
}