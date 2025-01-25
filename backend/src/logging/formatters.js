/**
 * Форматтеры для логов
 */
const { getCurrentUser } = require('./auth-context');
const winston = require('winston');
const format = winston.format
const { LOG_TYPES, config } = require('./config');
const path = require('path');

// Константы с шаблонами логов
const LOG_TEMPLATES = {
  console: {
    basic: '[{timestamp}] [{level}] [{type}] [{correlationId}] [{file}:{line}] [{userId}/{role}] [{message}]',
    http: '[{timestamp}] [{level}] [{method}] [{path}] [{statusCode}] [{responseTime}] [{userId}/{role}] [{ip}] [{message}]',
    withMetadata: '[{timestamp}] [{level}] [{type}] [{correlationId}] [{file}:{line}] [{userId}/{role}] [{message}] [Метаданные: {metadata}]'
  },
  file: {
    basic: '[{timestamp}] [{level}] [{type}] [{correlationId}] [{file}:{line}] [{userId}/{role}] [{ip}] [{message}]',
    http: '[{timestamp}] [{level}] [{method}] [{path}] [{statusCode}] [{responseTime}] [{userId}/{role}] [{ip}] [{message}]',
    withMetadata: '[{timestamp}] [{level}] [{type}] [{correlationId}] [{file}:{line}] [{userId}/{role}] [{ip}] [{message}] [Метаданные: {metadata}]'
  }
};

// Кэш для caller info
const callerCache = new Map();
const CALLER_CACHE_TTL = 1000; // 1 секунда

// Оптимизированный форматтер для получения информации о вызове
const getCallerInfo = () => {
  try {
    const stack = new Error().stack
      .split('\n')
      .slice(3) // Пропускаем первые 3 строки (Error и вызовы логгера)
      .map(line => line.trim());
    
    const stackRegex = /at\s+(?:(.+?)\s+\()?(?:([A-Za-z]:)?([^:]+):(\d+):(\d+)\)?|(.+)?)$/;
    
    for (const line of stack) {
      const match = line.match(stackRegex);
      if (!match) continue;

      const [, fnName, drive, pathPart, lineNo] = match;
      let fullPath = (drive || '') + (pathPart || match[6] || '');
      
      if (!fullPath) continue;

      // Нормализуем слеши для Windows
      fullPath = fullPath.replace(/\\/g, '/');

      // Пропускаем только реальные системные пути
      if (fullPath.includes('node_modules/winston') ||
          fullPath.includes('node_modules/logform') ||
          fullPath.includes('node_modules/readable-stream') ||
          fullPath.includes('node:internal/') ||
          fullPath.includes('node:events')) {
        continue;
      }

      // Получаем путь относительно backend/src
      const srcIndex = fullPath.indexOf('/backend/src/');
      if (srcIndex !== -1) {
        const relativePath = fullPath.substring(srcIndex + 13);
        return {
          file: relativePath,
          line: parseInt(lineNo, 10) || 0,
          function: fnName || 'anonymous'
        };
      }

      // Если backend/src не найден, ищем просто src
      const simpleSrcIndex = fullPath.indexOf('/src/');
      if (simpleSrcIndex !== -1) {
        const relativePath = fullPath.substring(simpleSrcIndex + 5);
        return {
          file: relativePath,
          line: parseInt(lineNo, 10) || 0,
          function: fnName || 'anonymous'
        };
      }

      // Если это путь без src, возвращаем его как есть
      return {
        file: fullPath,
        line: parseInt(lineNo, 10) || 0,
        function: fnName || 'anonymous'
      };
    }

    return {
      file: 'unknown',
      line: 0,
      function: 'unknown'
    };
  } catch (error) {
    return {
      file: 'unknown',
      line: 0,
      function: 'unknown'
    };
  }
};

// Форматтер для метаданных
const metadataFormatter = format((info) => {
  if (!info.metadata || Object.keys(info.metadata).length === 0) return info;

  const MAX_DEPTH = 2;
  const MAX_LENGTH = 500;

  const formatValue = (value, depth = 0) => {
    if (depth >= MAX_DEPTH) return '[...]';
    
    if (value === null || value === undefined) return 'null';
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      if (depth >= MAX_DEPTH - 1) return `[${value.length}]`;
      return `[${value.slice(0, 5).map(item => formatValue(item, depth + 1)).join(', ')}${value.length > 5 ? '...' : ''}]`;
    }
    if (typeof value === 'object') {
      if (Object.keys(value).length === 0) return '{}';
      if (depth >= MAX_DEPTH - 1) return '{...}';
      return formatObject(value, depth + 1);
    }
    if (typeof value === 'string') {
      if (value.length > 50) return `"${value.slice(0, 50)}..."`;
      return `"${value}"`;
    }
    return String(value);
  };

  const formatObject = (obj, depth = 0) => {
    const skipKeys = ['stack', 'originalCaller', 'headers', 'correlationId', 'req', 'res'];
    
    const entries = Object.entries(obj)
      .filter(([key, value]) => 
        value !== null && 
        value !== undefined && 
        !skipKeys.includes(key))
      .slice(0, 5)
      .map(([key, value]) => `${key}: ${formatValue(value, depth)}`);
    
    if (entries.length === 0) return null;
    
    let result = `{ ${entries.join(', ')}`;
    if (Object.keys(obj).length > 5) result += ', ...';
    result += ' }';
    
    if (result.length > MAX_LENGTH) {
      result = result.slice(0, MAX_LENGTH) + '...';
    }
    
    return result;
  };

  const formattedMetadata = formatObject(info.metadata);
  if (formattedMetadata) {
    info.formattedMetadata = formattedMetadata;
  }
  
  return info;
})();

// Форматтер для типа лога
const typeFormatter = format((info) => {
  if (!info.type) {
    info.type = LOG_TYPES.SYSTEM;
  }
  // Если тип совпадает с уровнем, не дублируем
  info.displayType = info.type === info.level ? '' : info.type;
  return info;
})();

// Форматтер для добавления correlationId
const correlationFormatter = format((info) => {
  if (!info.correlationId) {
    // Добавляем префикс req_ для HTTP запросов
    const prefix = info.type === LOG_TYPES.HTTP ? 'req_' : 'op_';
    info.correlationId = prefix + require('crypto').randomBytes(4).toString('hex');
  }
  return info;
})();

// Форматтер для информации о пользователе
const userFormatter = format((info) => {
  try {
    let user;
    
    // 1. Проверяем метаданные
    if (info.metadata?.user) {
      user = info.metadata.user;
    } 
    // 2. Проверяем контекст
    else {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id) {
        user = currentUser;
      }
    }
    
    // 3. Если пользователь не найден, используем системного
    if (!user || !user.id) {
      user = {
        id: 'system',
        role: 'system',
        email: null,
        username: 'System'
      };
    }
    
    // Нормализуем данные пользователя
    info.user = {
      id: user.id || 'unknown',
      role: user.role || 'unknown',
      username: user.username || user.first_name || user.name || null,
      email: user.email || null
    };
    
    return info;
  } catch (error) {
    console.error('Ошибка при определении пользователя:', error);
    // В случае ошибки используем системного пользователя
    info.user = {
      id: 'system',
      role: 'system',
      username: 'System',
      email: null
    };
    return info;
  }
})();

// Форматтер для вызовов
const callerFormatter = format((info) => {
  const originalCaller = info.metadata?.originalCaller || info.originalCaller;
  if (originalCaller) {
    const stackRegex = /at\s+(?:(.+?)\s+\()?(?:([A-Za-z]:)?([^:]+):(\d+):(\d+)\)?|(.+)?)$/;
    const match = originalCaller.match(stackRegex);
    
    if (match) {
      const [, fnName, drive, pathPart, lineNo] = match;
      let fullPath = (drive || '') + (pathPart || match[6] || '');
      
      if (fullPath) {
        // Нормализуем слеши для Windows
        fullPath = fullPath.replace(/\\/g, '/');
        
        // Ищем backend/src в пути
        const parts = fullPath.split('/');
        const backendIndex = parts.indexOf('backend');
        const srcIndex = parts.indexOf('src');
        
        if (backendIndex !== -1 && srcIndex !== -1 && backendIndex < srcIndex) {
          // Берем всё после src
          const relativePath = parts.slice(srcIndex + 1).join('/');
          info.caller = {
            file: relativePath,
            line: parseInt(lineNo, 10) || 0,
            function: fnName || 'anonymous'
          };
          return info;
        }
        
        // Если не нашли backend/src, берем последние 2 части пути
        const shortPath = parts.slice(-2).join('/');
        info.caller = {
          file: shortPath,
          line: parseInt(lineNo, 10) || 0,
          function: fnName || 'anonymous'
        };
        return info;
      }
    }
  }

  info.caller = {
    file: 'unknown',
    line: 0,
    function: 'unknown'
  };
  return info;
})();

// Форматтер для IP адреса
const ipFormatter = format((info) => {
  // Проверяем наличие req в самом объекте info
  const req = info.req || info.metadata?.req;
  if (req) {
    info.ip = 
      req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers?.['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      '127.0.0.1';
  }
  return info;
})();

// Функция очистки URL от параметров
const cleanUrl = (url) => {
  if (!url) return '';
  const urlObj = new URL(url, 'http://dummy');
  return urlObj.pathname;
};

// Основной форматтер для консоли
const consoleFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  ipFormatter,
  correlationFormatter,
  typeFormatter,
  userFormatter,
  callerFormatter,
  metadataFormatter,
  format.colorize(),
  format.printf(info => {
    const user = info.user || { id: 'anonymous', role: 'guest' };
    const userStr = `${user.id}/${user.role}`;
    const caller = info.caller || { file: 'unknown', line: 0 };
    const correlationId = info.correlationId || 'no-correlation';
    
    let template;
    if (info.method && info.path) {
      template = LOG_TEMPLATES.console.http;
    } else if (info.formattedMetadata) {
      template = LOG_TEMPLATES.console.withMetadata;
    } else {
      template = LOG_TEMPLATES.console.basic;
    }

    // Форматируем HTTP метод (3 символа)
    const method = info.method ? info.method.toUpperCase().padEnd(3) : '';

    // Форматируем статус код (3 символа)
    const statusCode = info.statusCode ? 
      info.statusCode.toString().padStart(3) : 
      (info.method ? '---' : '');

    // Форматируем время выполнения (8 символов включая ms)
    const responseTime = info.responseTime ? 
      info.responseTime.toFixed(2).toString().padStart(7) + 'ms' : 
      '   ---ms';

    // Очищаем URL от параметров запроса
    const path = info.path ? cleanUrl(info.path) : '';

    // Убираем двоеточие в конце сообщения
    let message = info.message;
    if (message.endsWith(':')) {
      message = message.slice(0, -1);
    }

    // Форматируем метаданные
    const metadata = info.formattedMetadata || '';

    return template
      .replace('{timestamp}', info.timestamp)
      .replace('{level}', info.level)
      .replace('{type}', info.type || '')
      .replace('{correlationId}', correlationId)
      .replace('{method}', method)
      .replace('{path}', path)
      .replace('{statusCode}', statusCode)
      .replace('{responseTime}', responseTime)
      .replace('{userId}/{role}', userStr)
      .replace('{ip}', info.ip || '127.0.0.1')
      .replace('{file}', caller.file)
      .replace('{line}', caller.line)
      .replace('{message}', message)
      .replace('{metadata}', metadata);
  })
);
  
// Форматтер для файлов
const fileFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  ipFormatter,
  correlationFormatter,
  typeFormatter,
  userFormatter,
  callerFormatter,
  metadataFormatter,
  format.printf(info => {
    const user = info.user || { id: 'anonymous', role: 'guest' };
    const userStr = `${user.id}/${user.role}`;
    const caller = info.caller || { file: 'unknown', line: 0 };
    const correlationId = info.correlationId || 'no-correlation';
    
    let template;
    if (info.method && info.path) {
      template = LOG_TEMPLATES.file.http;
    } else if (info.formattedMetadata) {
      template = LOG_TEMPLATES.file.withMetadata;
    } else {
      template = LOG_TEMPLATES.file.basic;
    }

    // Форматируем HTTP метод (3 символа)
    const method = info.method ? info.method.toUpperCase().padEnd(3) : '';

    // Форматируем статус код (3 символа)
    const statusCode = info.statusCode ? 
      info.statusCode.toString().padStart(3) : 
      (info.method ? '---' : '');

    // Форматируем время выполнения (8 символов включая ms)
    const responseTime = info.responseTime ? 
      info.responseTime.toFixed(2).toString().padStart(7) + 'ms' : 
      '   ---ms';

    // Очищаем URL от параметров запроса
    const path = info.path ? cleanUrl(info.path) : '';

    // Убираем двоеточие в конце сообщения
    let message = info.message;
    if (message.endsWith(':')) {
      message = message.slice(0, -1);
    }

    // Форматируем метаданные
    const metadata = info.formattedMetadata || '';

    return template
      .replace('{timestamp}', info.timestamp)
      .replace('{level}', info.level)
      .replace('{type}', info.type || '')
      .replace('{correlationId}', correlationId)
      .replace('{method}', method)
      .replace('{path}', path)
      .replace('{statusCode}', statusCode)
      .replace('{responseTime}', responseTime)
      .replace('{userId}/{role}', userStr)
      .replace('{ip}', info.ip || '127.0.0.1')
      .replace('{file}', caller.file)
      .replace('{line}', caller.line)
      .replace('{message}', message)
      .replace('{metadata}', metadata);
  })
);

module.exports = {
  consoleFormat,
  fileFormat,
  getCallerInfo,
  correlationFormatter,
  typeFormatter,
  userFormatter,
  metadataFormatter,
  callerFormatter,
  ipFormatter
}; 