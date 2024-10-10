/** @jsx h */
import { h } from 'preact'
import { render } from '@create-figma-plugin/ui'
import i18n from '@/i18n/ui'
import App from '@/ui/App'
import '!./styles/output.css'
import { I18nextProvider } from 'preact-i18next'

// Определение основного компонента плагина
function Plugin() {
  return (
    // Оборачиваем приложение в PreactI18nextProvider для обеспечения интернационализации
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  )
}

// Рендеринг плагина с использованием функции render из @create-figma-plugin/ui
export default render(Plugin)