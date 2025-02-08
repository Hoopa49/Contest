const fs = require('fs').promises;
const path = require('path');
const logger = require('../logging');

// Функция для обновления содержимого файла
async function updateFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let wasUpdated = false;
    
    // Заменяем старый импорт на новый
    if (content.includes("require('../utils/logger')")) {
      content = content.replace(
        /const\s*{\s*log\s*}\s*=\s*require\(['"]\.\.\/utils\/logger['"]\)/g,
        "const { logger } = require('../logging')"
      );
      
      // Заменяем использование log на logger с учетом метаданных
      content = content.replace(
        /\blog\.(error|warn|info|debug)\(([^)]+)\)/g,
        (match, level, args) => {
          // Если уже есть объект метаданных, оставляем как есть
          if (args.includes('metadata:')) {
            return `logger.${level}(${args})`;
          }
          
          // Проверяем, есть ли несколько аргументов
          const hasMultipleArgs = args.includes(',');
          
          if (hasMultipleArgs) {
            // Если есть несколько аргументов, первый используем как сообщение,
            // остальные помещаем в metadata
            const [message, ...rest] = args.split(',').map(arg => arg.trim());
            return `logger.${level}(${message}, { metadata: { data: ${rest.join(', ')} } })`;
          }
          
          // Если один аргумент, просто заменяем
          return `logger.${level}(${args})`;
        }
      );
      
      // Заменяем использование this.logger
      content = content.replace(
        /this\.logger\.(error|warn|info|debug)\(([^)]+)\)/g,
        (match, level, args) => {
          if (args.includes('metadata:')) {
            return `logger.${level}(${args})`;
          }
          const hasMultipleArgs = args.includes(',');
          if (hasMultipleArgs) {
            const [message, ...rest] = args.split(',').map(arg => arg.trim());
            return `logger.${level}(${message}, { metadata: { data: ${rest.join(', ')} } })`;
          }
          return `logger.${level}(${args})`;
        }
      );
      
      // Заменяем объявления this.logger
      content = content.replace(
        /this\.logger\s*=\s*require\(['"]\.\.\/utils\/logger['"]\)/g,
        "// Используем глобальный logger из '../logging'"
      );
      
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ Обновлен файл: ${filePath}`);
      wasUpdated = true;
    }
    
    // Если файл не был обновлен, но содержит упоминания логгера
    if (!wasUpdated && (
      content.includes('this.logger') || 
      content.includes('logger.') ||
      content.includes('log.')
    )) {
      console.log(`⚠️ Проверьте файл вручную: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Ошибка при обновлении файла ${filePath}:`, error);
  }
}

// Функция для рекурсивного обхода директории
async function processDirectory(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      // Пропускаем node_modules, .git и logs
      if (entry.name !== 'node_modules' && 
          entry.name !== '.git' && 
          entry.name !== 'logs') {
        await processDirectory(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      await updateFile(fullPath);
    }
  }
}

// Основная функция
async function main() {
  const srcDir = path.join(__dirname, '../src');
  
  try {
    console.log('🔄 Начинаем обновление логгера в файлах...');
    await processDirectory(srcDir);
    console.log('✨ Обновление завершено успешно!');
  } catch (error) {
    console.error('❌ Ошибка при обновлении файлов:', error);
    process.exit(1);
  }
}

// Запускаем скрипт
main(); 