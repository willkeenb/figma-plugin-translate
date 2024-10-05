const dotenv = require('dotenv')
// Загружаем переменные окружения из .env файла и преобразуем их в JSON строку
const env = JSON.stringify(dotenv.config().parsed)

module.exports = buildOptions => {
  // Определяем, находимся ли мы в производственном режиме
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    // Распространяем все существующие опции сборки
    ...buildOptions,

    // Определяем глобальные переменные для процесса сборки
    define: {
      'process.env': env,
    },

    // Включаем минификацию только в производственном режиме
    minify: isProduction,

    // В производственном режиме удаляем console.log и debugger statements
    drop: isProduction ? ['console', 'debugger'] : [],

    // Включаем tree shaking для удаления неиспользуемого кода
    treeShaking: true,

    // Управляем обработкой комментариев
    // В production удаляем все комментарии, в development оставляем встроенными
    legalComments: isProduction ? 'none' : 'inline',

    // Генерируем source maps только в режиме разработки
    sourcemap: !isProduction,

    // Указываем целевую версию ECMAScript для оптимизации под современные браузеры
    target: ['es2015'],

    // Настраиваем loader для обработки JSX в файлах с расширением .js
    loader: { '.js': 'jsx' },
  }
}