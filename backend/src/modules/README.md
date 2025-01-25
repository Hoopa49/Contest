# Структура модулей

## Общая структура для каждого модуля

```
module_name/
├── constants/
│   ├── module.constants.js
│   └── error.constants.js
│
├── controllers/
│   └── module.controller.js
│
├── services/
│   └── module.service.js
│
├── repositories/
│   ├── module.repository.js
│   └── module.cache.repository.js
│
├── models/
│   └── module.model.js
│
├── dto/
│   ├── requests/
│   │   ├── create.dto.js
│   │   └── update.dto.js
│   └── responses/
│       └── response.dto.js
│
├── interfaces/
│   ├── IService.js
│   └── IRepository.js
│
├── validation/
│   ├── validator.js
│   └── schemas/
│
├── routes/
│   └── module.routes.js
│
├── tests/
│   ├── unit/
│   └── integration/
│
└── index.js
```

## Модуль Auth

```
auth/
├── constants/
│   ├── auth.constants.js        # Константы JWT, роли пользователей
│   └── error.constants.js       # Коды ошибок аутентификации
│
├── controllers/
│   ├── auth.controller.js       # Основной контроллер аутентификации
│   └── password.controller.js   # Контроллер восстановления пароля
│
├── services/
│   ├── auth.service.js         # Сервис аутентификации
│   ├── token.service.js        # Сервис работы с токенами
│   └── password.service.js     # Сервис восстановления пароля
│
├── repositories/
│   ├── user.repository.js      # Репозиторий пользователей
│   └── token.repository.js     # Репозиторий токенов
│
├── models/
│   ├── user.model.js          # Модель пользователя
│   └── token.model.js         # Модель токена
│
├── dto/
│   ├── requests/
│   │   ├── login.dto.js
│   │   ├── register.dto.js
│   │   └── reset-password.dto.js
│   └── responses/
│       ├── auth.response.dto.js
│       └── user.response.dto.js
```

## Модуль Contest

```
contest/
├── constants/
│   ├── contest.constants.js     # Статусы, типы конкурсов
│   └── error.constants.js       # Коды ошибок конкурсов
│
├── controllers/
│   ├── contest.controller.js    # Управление конкурсами
│   ├── participant.controller.js # Управление участниками
│   └── review.controller.js     # Управление отзывами
│
├── services/
│   ├── contest.service.js      # Бизнес-логика конкурсов
│   ├── participant.service.js  # Сервис участников
│   └── review.service.js       # Сервис отзывов
│
├── repositories/
│   ├── contest.repository.js   # Работа с БД конкурсов
│   └── review.repository.js    # Работа с БД отзывов
│
├── models/
│   ├── contest.model.js       # Модель конкурса
│   ├── participant.model.js   # Модель участника
│   └── review.model.js        # Модель отзыва
│
├── dto/
│   ├── requests/
│   │   ├── create-contest.dto.js
│   │   └── submit-review.dto.js
│   └── responses/
│       ├── contest.response.dto.js
│       └── review.response.dto.js
```

## Модуль Instagram

```
instagram/
├── constants/
│   ├── instagram.constants.js   # API endpoints, типы медиа
│   └── error.constants.js       # Коды ошибок Instagram API
│
├── controllers/
│   ├── instagram.controller.js  # Основной контроллер
│   └── media.controller.js      # Контроллер медиа
│
├── services/
│   ├── instagram.service.js    # Основной сервис
│   ├── media.service.js        # Сервис медиа
│   └── auth.service.js         # Сервис авторизации
│
├── repositories/
│   ├── instagram.repository.js # Основной репозиторий
│   └── media.repository.js     # Репозиторий медиа
│
├── models/
│   ├── profile.model.js       # Модель профиля
│   └── media.model.js         # Модель медиа
│
├── dto/
│   ├── requests/
│   │   ├── post-media.dto.js
│   │   └── update-profile.dto.js
│   └── responses/
│       ├── profile.response.dto.js
│       └── media.response.dto.js
```

## Модуль Notifications

```
notifications/
├── constants/
│   ├── notification.constants.js # Типы уведомлений, приоритеты
│   └── error.constants.js        # Коды ошибок уведомлений
│
├── controllers/
│   ├── notification.controller.js # Основной контроллер
│   └── template.controller.js     # Контроллер шаблонов
│
├── services/
│   ├── notification.service.js   # Основной сервис
│   ├── email.service.js         # Email сервис
│   └── push.service.js          # Push уведомления
│
├── repositories/
│   ├── notification.repository.js # Основной репозиторий
│   └── template.repository.js     # Репозиторий шаблонов
│
├── models/
│   ├── notification.model.js    # Модель уведомления
│   └── template.model.js        # Модель шаблона
│
├── dto/
│   ├── requests/
│   │   ├── send-notification.dto.js
│   │   └── create-template.dto.js
│   └── responses/
│       └── notification.response.dto.js
```

## Модуль Statistics

```
statistics/
├── constants/
│   ├── statistics.constants.js  # Типы статистики, периоды
│   └── error.constants.js       # Коды ошибок статистики
│
├── controllers/
│   ├── statistics.controller.js # Основной контроллер
│   └── report.controller.js     # Контроллер отчетов
│
├── services/
│   ├── statistics.service.js   # Основной сервис
│   ├── analytics.service.js    # Сервис аналитики
│   └── report.service.js       # Сервис отчетов
│
├── repositories/
│   ├── statistics.repository.js # Основной репозиторий
│   └── report.repository.js     # Репозиторий отчетов
│
├── models/
│   ├── statistic.model.js     # Модель статистики
│   └── report.model.js        # Модель отчета
│
├── dto/
│   ├── requests/
│   │   ├── generate-report.dto.js
│   │   └── filter-stats.dto.js
│   └── responses/
│       ├── statistics.response.dto.js
│       └── report.response.dto.js
```

## Модуль Telegram

```
telegram/
├── constants/
│   ├── telegram.constants.js    # API endpoints, типы сообщений
│   └── error.constants.js       # Коды ошибок Telegram API
│
├── controllers/
│   ├── telegram.controller.js   # Основной контроллер
│   └── bot.controller.js        # Контроллер бота
│
├── services/
│   ├── telegram.service.js     # Основной сервис
│   ├── bot.service.js          # Сервис бота
│   └── message.service.js      # Сервис сообщений
│
├── repositories/
│   ├── telegram.repository.js  # Основной репозиторий
│   └── message.repository.js   # Репозиторий сообщений
│
├── models/
│   ├── chat.model.js          # Модель чата
│   └── message.model.js       # Модель сообщения
│
├── dto/
│   ├── requests/
│   │   ├── send-message.dto.js
│   │   └── update-bot.dto.js
│   └── responses/
│       ├── message.response.dto.js
│       └── chat.response.dto.js
```

## Модуль VK

```
vk/
├── constants/
│   ├── vk.constants.js         # API endpoints, типы контента
│   └── error.constants.js      # Коды ошибок VK API
│
├── controllers/
│   ├── vk.controller.js        # Основной контроллер
│   └── group.controller.js     # Контроллер групп
│
├── services/
│   ├── vk.service.js          # Основной сервис
│   ├── post.service.js        # Сервис постов
│   └── auth.service.js        # Сервис авторизации
│
├── repositories/
│   ├── vk.repository.js       # Основной репозиторий
│   └── post.repository.js     # Репозиторий постов
│
├── models/
│   ├── group.model.js         # Модель группы
│   └── post.model.js          # Модель поста
│
├── dto/
│   ├── requests/
│   │   ├── create-post.dto.js
│   │   └── update-group.dto.js
│   └── responses/
│       ├── post.response.dto.js
│       └── group.response.dto.js
```

## Модуль YouTube

```
youtube/
├── constants/
│   ├── youtube.constants.js     # API endpoints, типы видео
│   └── error.constants.js       # Коды ошибок YouTube API
│
├── controllers/
│   ├── youtube.controller.js    # Основной контроллер
│   ├── analytics.controller.js  # Контроллер аналитики
│   └── auth.controller.js       # Контроллер авторизации
│
├── services/
│   ├── youtube.service.js      # Основной сервис
│   ├── analytics.service.js    # Сервис аналитики
│   └── auth.service.js         # Сервис авторизации
│
├── repositories/
│   ├── youtube.repository.js   # Основной репозиторий
│   └── analytics.repository.js # Репозиторий аналитики
│
├── models/
│   ├── channel.model.js       # Модель канала
│   ├── video.model.js         # Модель видео
│   └── analytics.model.js     # Модель аналитики
│
├── dto/
│   ├── requests/
│   │   ├── upload-video.dto.js
│   │   └── update-channel.dto.js
│   └── responses/
│       ├── video.response.dto.js
│       └── channel.response.dto.js
```

## Модуль User

```
user/
├── constants/
│   ├── user.constants.js       # Роли, статусы пользователей
│   └── error.constants.js      # Коды ошибок
│
├── controllers/
│   ├── user.controller.js      # Управление пользователями
│   └── profile.controller.js   # Управление профилями
│
├── services/
│   ├── user.service.js        # Основной сервис
│   └── profile.service.js     # Сервис профилей
│
├── repositories/
│   ├── user.repository.js     # Репозиторий пользователей
│   └── profile.repository.js  # Репозиторий профилей
│
├── models/
│   ├── user.model.js         # Модель пользователя
│   └── profile.model.js      # Модель профиля
│
├── dto/
│   ├── requests/
│   │   ├── update-user.dto.js
│   │   └── update-profile.dto.js
│   └── responses/
│       ├── user.response.dto.js
│       └── profile.response.dto.js
```

## Модуль Payment

```
payment/
├── constants/
│   ├── payment.constants.js    # Статусы платежей, типы
│   └── error.constants.js      # Коды ошибок
│
├── controllers/
│   ├── payment.controller.js   # Основной контроллер
│   └── invoice.controller.js   # Контроллер счетов
│
├── services/
│   ├── payment.service.js     # Основной сервис
│   ├── stripe.service.js      # Сервис Stripe
│   └── paypal.service.js      # Сервис PayPal
│
├── repositories/
│   ├── payment.repository.js  # Основной репозиторий
│   └── invoice.repository.js  # Репозиторий счетов
│
├── models/
│   ├── payment.model.js      # Модель платежа
│   └── invoice.model.js      # Модель счёта
│
├── dto/
│   ├── requests/
│   │   ├── create-payment.dto.js
│   │   └── create-invoice.dto.js
│   └── responses/
│       ├── payment.response.dto.js
│       └── invoice.response.dto.js
```

## Модуль File

```
file/
├── constants/
│   ├── file.constants.js      # Типы файлов, лимиты
│   └── error.constants.js     # Коды ошибок
│
├── controllers/
│   ├── file.controller.js     # Основной контроллер
│   └── upload.controller.js   # Контроллер загрузки
│
├── services/
│   ├── file.service.js       # Основной сервис
│   ├── storage.service.js    # Сервис хранения
│   └── compress.service.js   # Сервис сжатия
│
├── repositories/
│   └── file.repository.js    # Репозиторий файлов
│
├── models/
│   └── file.model.js        # Модель файла
│
├── dto/
│   ├── requests/
│   │   ├── upload-file.dto.js
│   │   └── update-file.dto.js
│   └── responses/
│       └── file.response.dto.js
```

## Модуль Common

```
common/
├── constants/
│   ├── common.constants.js    # Общие константы
│   └── error.constants.js     # Общие коды ошибок
│
├── middleware/
│   ├── auth.middleware.js    # Аутентификация
│   ├── error.middleware.js   # Обработка ошибок
│   └── logger.middleware.js  # Логирование
│
├── utils/
│   ├── date.utils.js        # Работа с датами
│   ├── string.utils.js      # Работа со строками
│   └── validation.utils.js  # Общая валидация
│
├── services/
│   ├── logger.service.js    # Сервис логирования
│   └── cache.service.js     # Сервис кэширования
│
├── interfaces/
│   └── common.interfaces.js # Общие интерфейсы
```

## Модуль Admin

```
admin/
├── constants/
│   ├── admin.constants.js     # Права доступа, роли
│   └── error.constants.js     # Коды ошибок
│
├── controllers/
│   ├── admin.controller.js    # Основной контроллер
│   └── dashboard.controller.js # Контроллер дашборда
│
├── services/
│   ├── admin.service.js      # Основной сервис
│   └── audit.service.js      # Сервис аудита
│
├── repositories/
│   ├── admin.repository.js   # Основной репозиторий
│   └── audit.repository.js   # Репозиторий аудита
│
├── models/
│   ├── admin.model.js       # Модель администратора
│   └── audit.model.js       # Модель аудита
│
├── dto/
│   ├── requests/
│   │   └── admin-action.dto.js
│   └── responses/
│       └── audit-log.response.dto.js
```

## Модуль Logger

```
logger/
├── constants/
│   ├── logger.constants.js    # Уровни логирования, форматы
│   └── error.constants.js     # Коды ошибок логирования
│
├── controllers/
│   └── logger.controller.js   # Контроллер для управления логами
│
├── services/
│   ├── logger.service.js     # Основной сервис логирования
│   ├── transport.service.js  # Сервис транспорта логов
│   └── format.service.js     # Сервис форматирования логов
│
├── repositories/
│   ├── logger.repository.js  # Репозиторий логов
│   └── metrics.repository.js # Репозиторий метрик
│
├── models/
│   ├── log.model.js         # Модель лога
│   └── metric.model.js      # Модель метрики
│
├── interfaces/
│   ├── ILogger.js          # Интерфейс логгера
│   └── ITransport.js       # Интерфейс транспорта
│
├── dto/
│   ├── requests/
│   │   └── create-log.dto.js
│   └── responses/
│       ├── log.response.dto.js
│       └── metric.response.dto.js
│
├── decorators/
│   ├── log.decorator.js    # Декоратор для методов
│   └── metric.decorator.js # Декоратор для метрик
│
└── transports/
    ├── file.transport.js   # Транспорт в файлы
    ├── console.transport.js # Транспорт в консоль
    └── elastic.transport.js # Транспорт в Elasticsearch
```

## Модуль Error Handler

```
error-handler/
├── constants/
│   ├── error.constants.js     # Типы ошибок, коды
│   └── message.constants.js   # Шаблоны сообщений
│
├── controllers/
│   └── error.controller.js    # Контроллер обработки ошибок
│
├── services/
│   ├── error.service.js      # Основной сервис
│   ├── notification.service.js # Сервис уведомлений об ошибках
│   └── report.service.js     # Сервис отчетов об ошибках
│
├── repositories/
│   └── error.repository.js   # Репозиторий ошибок
│
├── models/
│   └── error.model.js       # Модель ошибки
│
├── interfaces/
│   ├── IError.js           # Интерфейс ошибки
│   └── IErrorHandler.js    # Интерфейс обработчика
│
├── dto/
│   ├── requests/
│   │   └── error-report.dto.js
│   └── responses/
│       └── error.response.dto.js
│
├── handlers/
│   ├── validation.handler.js # Обработчик ошибок валидации
│   ├── database.handler.js   # Обработчик ошибок БД
│   ├── http.handler.js      # Обработчик HTTP ошибок
│   └── business.handler.js   # Обработчик бизнес-ошибок
│
├── filters/
│   ├── error.filter.js     # Фильтр ошибок
│   └── stack.filter.js     # Фильтр стека ошибок
│
└── decorators/
    └── catch.decorator.js  # Декоратор для перехвата ошибок
```

## Модуль Database

```
database/
├── constants/
│   ├── database.constants.js   # Константы подключения, типы
│   └── error.constants.js      # Коды ошибок БД
│
├── services/
│   ├── database.service.js    # Основной сервис
│   ├── migration.service.js   # Сервис миграций
│   └── backup.service.js      # Сервис резервного копирования
│
├── repositories/
│   └── base.repository.js     # Базовый репозиторий
│
├── interfaces/
│   ├── IDatabase.js          # Интерфейс БД
│   └── IRepository.js        # Интерфейс репозитория
│
├── migrations/
│   └── templates/            # Шаблоны миграций
│
├── seeders/                  # Сидеры для тестовых данных
│   └── templates/
│
└── config/
    ├── connection.config.js  # Конфигурация подключений
    └── pool.config.js        # Настройки пула соединений
```

## Модуль Cache

```
cache/
├── constants/
│   ├── cache.constants.js     # Типы кэша, TTL
│   └── error.constants.js     # Коды ошибок кэша
│
├── services/
│   ├── cache.service.js      # Основной сервис
│   ├── redis.service.js      # Сервис Redis
│   └── memory.service.js     # In-memory кэш
│
├── repositories/
│   └── cache.repository.js   # Репозиторий кэша
│
├── interfaces/
│   ├── ICache.js           # Интерфейс кэша
│   └── IStorage.js         # Интерфейс хранилища
│
├── decorators/
│   ├── cache.decorator.js  # Декоратор кэширования
│   └── clear.decorator.js  # Декоратор очистки кэша
│
└── strategies/
    ├── lru.strategy.js    # LRU стратегия
    └── fifo.strategy.js   # FIFO стратегия
```

## Модуль Queue

```
queue/
├── constants/
│   ├── queue.constants.js     # Типы очередей, приоритеты
│   └── error.constants.js     # Коды ошибок
│
├── services/
│   ├── queue.service.js      # Основной сервис
│   ├── worker.service.js     # Сервис обработчиков
│   └── scheduler.service.js  # Планировщик задач
│
├── processors/
│   ├── email.processor.js   # Обработчик email
│   └── notification.processor.js # Обработчик уведомлений
│
├── jobs/
│   ├── base.job.js         # Базовый класс задачи
│   └── retry.strategy.js   # Стратегия повторов
│
├── interfaces/
│   ├── IQueue.js          # Интерфейс очереди
│   └── IJob.js           # Интерфейс задачи
│
└── decorators/
    └── queue.decorator.js # Декоратор для задач
```

## Модуль Security

```
security/
├── constants/
│   ├── security.constants.js  # Политики безопасности
│   └── error.constants.js     # Коды ошибок
│
├── services/
│   ├── security.service.js   # Основной сервис
│   ├── encryption.service.js # Сервис шифрования
│   └── firewall.service.js   # Сервис файрвола
│
├── middleware/
│   ├── rate-limit.middleware.js  # Ограничение запросов
│   ├── cors.middleware.js        # CORS политики
│   └── xss.middleware.js         # Защита от XSS
│
├── policies/
│   ├── password.policy.js    # Политика паролей
│   └── access.policy.js      # Политика доступа
│
├── encryption/
│   ├── hash.service.js      # Хэширование
│   └── crypto.service.js    # Криптография
│
└── scanners/
    ├── vulnerability.scanner.js # Сканер уязвимостей
    └── dependency.scanner.js    # Сканер зависимостей
```

## Модуль API

```
api/
├── constants/
│   ├── api.constants.js      # Версии API, endpoints
│   └── error.constants.js    # Коды ошибок API
│
├── middleware/
│   ├── version.middleware.js # Версионирование API
│   └── transform.middleware.js # Трансформация данных
│
├── documentation/
│   ├── swagger/             # Swagger документация
│   └── schemas/             # JSON схемы
│
├── validators/
│   ├── request.validator.js # Валидация запросов
│   └── response.validator.js # Валидация ответов
│
├── transformers/
│   ├── request.transformer.js # Трансформация запросов
│   └── response.transformer.js # Трансформация ответов
│
└── versioning/
    └── strategies/          # Стратегии версионирования
```

## Модуль Config

```
config/
├── constants/
│   ├── config.constants.js    # Константы конфигурации
│   └── error.constants.js     # Коды ошибок
│
├── services/
│   ├── config.service.js     # Основной сервис
│   ├── env.service.js        # Сервис переменных окружения
│   └── vault.service.js      # Сервис для секретов
│
├── providers/
│   ├── env.provider.js      # Провайдер для .env
│   ├── json.provider.js     # Провайдер для JSON
│   └── yaml.provider.js     # Провайдер для YAML
│
├── interfaces/
│   └── IConfigProvider.js   # Интерфейс провайдера
│
└── schemas/                 # Схемы конфигураций
    ├── app.schema.js
    ├── database.schema.js
    └── cache.schema.js
```

## Модуль Monitoring

```
monitoring/
├── constants/
│   ├── monitoring.constants.js # Типы метрик
│   └── error.constants.js      # Коды ошибок
│
├── services/
│   ├── monitoring.service.js  # Основной сервис
│   ├── metrics.service.js     # Сервис метрик
│   └── health.service.js      # Сервис проверки здоровья
│
├── collectors/
│   ├── performance.collector.js # Сбор производительности
│   ├── memory.collector.js     # Сбор памяти
│   └── cpu.collector.js        # Сбор CPU
│
├── exporters/
│   ├── prometheus.exporter.js # Экспорт в Prometheus
│   └── grafana.exporter.js    # Экспорт в Grafana
│
└── health/
    ├── database.check.js     # Проверка БД
    ├── redis.check.js        # Проверка Redis
    └── api.check.js          # Проверка API
```

## Модуль WebSocket

```
websocket/
├── constants/
│   ├── websocket.constants.js # События, типы
│   └── error.constants.js     # Коды ошибок
│
├── services/
│   ├── websocket.service.js  # Основной сервис
│   ├── room.service.js       # Сервис комнат
│   └── event.service.js      # Сервис событий
│
├── handlers/
│   ├── connection.handler.js # Обработчик подключений
│   ├── message.handler.js    # Обработчик сообщений
│   └── error.handler.js      # Обработчик ошибок
│
├── middleware/
│   ├── auth.middleware.js   # Аутентификация
│   └── rate.middleware.js   # Ограничение запросов
│
└── events/
    ├── base.event.js       # Базовый класс события
    └── types/              # Типы событий
```

## Модуль Search

```
search/
├── constants/
│   ├── search.constants.js   # Типы поиска, индексы
│   └── error.constants.js    # Коды ошибок
│
├── services/
│   ├── search.service.js    # Основной сервис
│   ├── elastic.service.js   # Сервис Elasticsearch
│   └── index.service.js     # Сервис индексации
│
├── analyzers/
│   ├── text.analyzer.js    # Анализатор текста
│   └── fuzzy.analyzer.js   # Нечеткий поиск
│
├── indices/
│   ├── user.index.js      # Индекс пользователей
│   └── content.index.js   # Индекс контента
│
└── mappings/              # Маппинги для индексов
    └── templates/
```

## Модуль Task

```
task/
├── constants/
│   ├── task.constants.js    # Типы задач, статусы
│   └── error.constants.js   # Коды ошибок
│
├── services/
│   ├── task.service.js     # Основной сервис
│   ├── scheduler.service.js # Планировщик
│   └── executor.service.js  # Исполнитель
│
├── executors/
│   ├── sync.executor.js    # Синхронный исполнитель
│   └── async.executor.js   # Асинхронный исполнитель
│
├── strategies/
│   ├── retry.strategy.js   # Стратегия повторов
│   └── timeout.strategy.js # Стратегия таймаутов
│
└── tasks/                  # Конкретные задачи
    ├── cleanup.task.js
    └── backup.task.js
```

## Модуль Integration

```
integration/
├── constants/
│   ├── integration.constants.js # Типы интеграций
│   └── error.constants.js      # Коды ошибок
│
├── services/
│   ├── integration.service.js  # Основной сервис
│   └── webhook.service.js      # Сервис вебхуков
│
├── adapters/                   # Адаптеры для разных сервисов
│   ├── payment.adapter.js
│   └── shipping.adapter.js
│
├── webhooks/
│   ├── handlers/              # Обработчики вебхуков
│   └── validators/            # Валидаторы вебхуков
│
└── providers/                 # Провайдеры внешних сервисов
    ├── aws/
    ├── google/
    └── microsoft/
```

## Модуль Analytics

```
analytics/
├── constants/
│   ├── analytics.constants.js # Типы аналитики
│   └── error.constants.js     # Коды ошибок
│
├── services/
│   ├── analytics.service.js  # Основной сервис
│   ├── tracking.service.js   # Сервис отслеживания
│   └── report.service.js     # Сервис отчетов
│
├── trackers/
│   ├── user.tracker.js      # Трекер пользователей
│   └── event.tracker.js     # Трекер событий
│
├── aggregators/
│   ├── daily.aggregator.js  # Дневная агрегация
│   └── monthly.aggregator.js # Месячная агрегация
│
└── visualizers/
    ├── chart.generator.js   # Генератор графиков
    └── report.generator.js  # Генератор отчетов
```

## Модуль Testing

```
testing/
├── constants/
│   ├── testing.constants.js  # Константы тестирования
│   └── error.constants.js    # Коды ошибок
│
├── services/
│   ├── testing.service.js   # Основной сервис
│   └── mock.service.js      # Сервис моков
│
├── factories/
│   ├── user.factory.js     # Фабрика пользователей
│   └── data.factory.js     # Фабрика данных
│
├── mocks/
│   ├── api.mock.js        # Моки API
│   └── database.mock.js   # Моки базы данных
│
└── helpers/
    ├── test.helper.js     # Вспомогательные функции
    └── assertion.helper.js # Функции проверок
```

## Модуль Email

```
email/
├── constants/
│   ├── email.constants.js    # Типы писем, шаблоны
│   └── error.constants.js    # Коды ошибок
│
├── services/
│   ├── email.service.js     # Основной сервис
│   ├── template.service.js  # Сервис шаблонов
│   └── sender.service.js    # Сервис отправки
│
├── templates/
│   ├── auth/               # Шаблоны авторизации
│   ├── notification/       # Шаблоны уведомлений
│   └── marketing/         # Маркетинговые шаблоны
│
├── providers/
│   ├── smtp.provider.js   # SMTP провайдер
│   ├── sendgrid.provider.js # SendGrid провайдер
│   └── mailgun.provider.js  # Mailgun провайдер
│
└── validators/
    └── email.validator.js  # Валидация email
```

## Модуль i18n

```
i18n/
├── constants/
│   ├── i18n.constants.js    # Языки, форматы
│   └── error.constants.js   # Коды ошибок
│
├── services/
│   ├── i18n.service.js     # Основной сервис
│   └── locale.service.js   # Сервис локализации
│
├── locales/
│   ├── en/                # Английский
│   ├── ru/                # Русский
│   └── es/                # Испанский
│
├── formatters/
│   ├── date.formatter.js  # Форматирование дат
│   ├── number.formatter.js # Форматирование чисел
│   └── currency.formatter.js # Форматирование валют
│
└── middleware/
    └── locale.middleware.js # Определение локали
```

## Модуль Scheduler

```
scheduler/
├── constants/
│   ├── scheduler.constants.js # Типы расписаний
│   └── error.constants.js     # Коды ошибок
│
├── services/
│   ├── scheduler.service.js  # Основной сервис
│   └── cron.service.js      # Сервис cron задач
│
├── jobs/
│   ├── backup.job.js       # Резервное копирование
│   ├── cleanup.job.js      # Очистка данных
│   └── report.job.js       # Генерация отчетов
│
├── triggers/
│   ├── time.trigger.js    # Временные триггеры
│   └── event.trigger.js   # Событийные триггеры
│
└── handlers/
    └── job.handler.js     # Обработчик задач
```

## Модуль Validation

```
validation/
├── constants/
│   ├── validation.constants.js # Правила валидации
│   └── error.constants.js      # Коды ошибок
│
├── services/
│   └── validation.service.js  # Основной сервис
│
├── validators/
│   ├── string.validator.js   # Валидация строк
│   ├── number.validator.js   # Валидация чисел
│   └── object.validator.js   # Валидация объектов
│
├── schemas/
│   ├── user.schema.js       # Схема пользователя
│   └── payment.schema.js    # Схема платежа
│
└── decorators/
    └── validate.decorator.js # Декоратор валидации
```

## Модуль Audit

```
audit/
├── constants/
│   ├── audit.constants.js   # Типы событий аудита
│   └── error.constants.js   # Коды ошибок
│
├── services/
│   ├── audit.service.js    # Основной сервис
│   └── report.service.js   # Сервис отчетов
│
├── collectors/
│   ├── user.collector.js   # Сбор действий пользователей
│   └── system.collector.js # Сбор системных событий
│
├── formatters/
│   └── event.formatter.js  # Форматирование событий
│
└── exporters/
    ├── csv.exporter.js    # Экспорт в CSV
    └── pdf.exporter.js    # Экспорт в PDF
```

## Модуль Notification Hub

```
notification-hub/
├── constants/
│   ├── notification.constants.js # Типы уведомлений
│   └── error.constants.js       # Коды ошибок
│
├── services/
│   ├── notification.service.js  # Основной сервис
│   ├── channel.service.js      # Сервис каналов доставки
│   └── template.service.js     # Сервис шаблонов
│
├── channels/
│   ├── email.channel.js       # Email канал
│   ├── sms.channel.js        # SMS канал
│   ├── push.channel.js       # Push уведомления
│   └── telegram.channel.js   # Telegram канал
│
├── templates/
│   ├── email/               # Email шаблоны
│   ├── sms/                # SMS шаблоны
│   └── push/               # Push шаблоны
│
└── strategies/
    ├── delivery.strategy.js # Стратегия доставки
    └── retry.strategy.js    # Стратегия повторов
```

## Модуль Rate Limiter

```
rate-limiter/
├── constants/
│   ├── limiter.constants.js  # Лимиты, периоды
│   └── error.constants.js    # Коды ошибок
│
├── services/
│   ├── limiter.service.js   # Основной сервис
│   └── storage.service.js   # Сервис хранения
│
├── strategies/
│   ├── fixed.strategy.js    # Фиксированное окно
│   ├── sliding.strategy.js  # Скользящее окно
│   └── token.strategy.js    # Token bucket
│
├── middleware/
│   ├── api.limiter.js      # Лимитер для API
│   └── user.limiter.js     # Лимитер для пользователей
│
└── storage/
    ├── memory.storage.js   # In-memory хранилище
    └── redis.storage.js    # Redis хранилище
```

## Модуль Event Bus

```
event-bus/
├── constants/
│   ├── event.constants.js   # Типы событий
│   └── error.constants.js   # Коды ошибок
│
├── services/
│   ├── event-bus.service.js # Основной сервис
│   └── publisher.service.js # Сервис публикации
│
├── subscribers/
│   ├── email.subscriber.js  # Подписчик email
│   └── log.subscriber.js    # Подписчик логов
│
├── publishers/
│   └── base.publisher.js   # Базовый издатель
│
└── handlers/
    ├── retry.handler.js    # Обработчик повторов
    └── error.handler.js    # Обработчик ошибок
```

## Модуль Backup

```
backup/
├── constants/
│   ├── backup.constants.js  # Типы бэкапов
│   └── error.constants.js   # Коды ошибок
│
├── services/
│   ├── backup.service.js   # Основной сервис
│   └── restore.service.js  # Сервис восстановления
│
├── strategies/
│   ├── full.strategy.js    # Полное копирование
│   └── incremental.strategy.js # Инкрементальное
│
├── storage/
│   ├── s3.storage.js      # AWS S3 хранилище
│   └── local.storage.js   # Локальное хранилище
│
└── validators/
    └── backup.validator.js # Валидация бэкапов
```

## Модуль Documentation

```
documentation/
├── constants/
│   └── doc.constants.js    # Константы документации
│
├── services/
│   ├── doc.service.js     # Основной сервис
│   └── generator.service.js # Генератор документации
│
├── templates/
│   ├── api/              # Шаблоны API
│   ├── database/         # Шаблоны БД
│   └── architecture/     # Шаблоны архитектуры
│
├── generators/
│   ├── swagger.generator.js # Генератор Swagger
│   └── markdown.generator.js # Генератор Markdown
│
└── exporters/
    ├── html.exporter.js  # Экспорт в HTML
    └── pdf.exporter.js   # Экспорт в PDF
```

## Модуль ACL

```
acl/
├── constants/
│   ├── acl.constants.js     # Права, роли, ресурсы
│   └── error.constants.js   # Коды ошибок
│
├── services/
│   ├── acl.service.js      # Основной сервис
│   ├── role.service.js     # Сервис ролей
│   └── permission.service.js # Сервис разрешений
│
├── models/
│   ├── role.model.js       # Модель роли
│   ├── permission.model.js # Модель разрешения
│   └── resource.model.js   # Модель ресурса
│
├── decorators/
│   ├── check-permission.decorator.js # Проверка прав
│   └── role-required.decorator.js    # Проверка роли
│
└── policies/
    ├── user.policy.js     # Политики для пользователей
    └── admin.policy.js    # Политики для админов
```

## Модуль Session

```
session/
├── constants/
│   ├── session.constants.js # Типы сессий
│   └── error.constants.js   # Коды ошибок
│
├── services/
│   ├── session.service.js  # Основной сервис
│   └── storage.service.js  # Сервис хранения
│
├── models/
│   └── session.model.js   # Модель сессии
│
├── middleware/
│   ├── session.middleware.js # Обработка сессий
│   └── cleanup.middleware.js # Очистка сессий
│
└── stores/
    ├── redis.store.js    # Redis хранилище
    └── memory.store.js   # In-memory хранилище
```

## Модуль Metrics

```
metrics/
├── constants/
│   ├── metrics.constants.js # Типы метрик
│   └── error.constants.js   # Коды ошибок
│
├── services/
│   ├── metrics.service.js  # Основной сервис
│   └── collector.service.js # Сбор метрик
│
├── collectors/
│   ├── business.collector.js # Бизнес-метрики
│   ├── user.collector.js    # Метрики пользователей
│   └── finance.collector.js # Финансовые метрики
│
├── analyzers/
│   ├── trend.analyzer.js   # Анализ трендов
│   └── anomaly.analyzer.js # Поиск аномалий
│
└── dashboards/
    ├── business.dashboard.js # Бизнес-показатели
    └── technical.dashboard.js # Технические метрики
```

## Модуль Migration

```
migration/
├── constants/
│   ├── migration.constants.js # Типы миграций
│   └── error.constants.js     # Коды ошибок
│
├── services/
│   ├── migration.service.js  # Основной сервис
│   └── version.service.js    # Контроль версий
│
├── strategies/
│   ├── data.strategy.js     # Миграция данных
│   └── schema.strategy.js   # Миграция схем
│
├── validators/
│   ├── data.validator.js    # Валидация данных
│   └── schema.validator.js  # Валидация схем
│
└── transformers/
    ├── data.transformer.js  # Трансформация данных
    └── schema.transformer.js # Трансформация схем
```

## Модуль Gateway

```
gateway/
├── constants/
│   ├── gateway.constants.js # Маршруты, сервисы
│   └── error.constants.js   # Коды ошибок
│
├── services/
│   ├── gateway.service.js  # Основной сервис
│   ├── routing.service.js  # Маршрутизация
│   └── discovery.service.js # Обнаружение сервисов
│
├── middleware/
│   ├── auth.middleware.js  # Аутентификация
│   ├── cors.middleware.js  # CORS
│   └── proxy.middleware.js # Прокси
│
├── load-balancer/
│   ├── round-robin.js     # Round Robin балансировка
│   └── weighted.js        # Взвешенная балансировка
│
└── transformers/
    ├── request.transformer.js # Трансформация запросов
    └── response.transformer.js # Трансформация ответов
``` 