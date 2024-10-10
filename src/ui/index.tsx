/** @jsx h */
import { h } from 'preact'
import { render } from '@create-figma-plugin/ui'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/ui'
import App from '@/ui/App'
import '!./styles/output.css'
import { emit } from '@create-figma-plugin/utilities'

// Функция для отправки отладочных сообщений
function sendDebugMessage(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Debug:', message, data);
    emit('DEBUG_MESSAGE', { message, data });
  }
}

// Определение основного компонента плагина
function Plugin() {
  sendDebugMessage('Plugin component rendering');

  return (
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  )
}

// Добавим глобальный обработчик ошибок
if (process.env.NODE_ENV === 'development') {
  window.onerror = (message, source, lineno, colno, error) => {
    sendDebugMessage('Global error caught', { message, source, lineno, colno, error });
  };
}

// Рендеринг плагина с использованием функции render из @create-figma-plugin/ui
export default render(Plugin)

// Пример использования
sendDebugMessage('Plugin initialized');