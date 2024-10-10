module.exports = buildOptions => {
  // Определяем, находимся ли мы в производственном режиме
  const isProduction = process.env.NODE_ENV === 'production'

  // Возвращаем новый объект с опциями сборки
  return {
    // Распространяем все существующие опции сборки
    ...buildOptions,

    // Включаем минификацию только в производственном режиме
    minify: isProduction,

    // В производственном режиме удаляем console.log и debugger statements
    drop: isProduction ? ['console', 'debugger'] : [],
  }
}