/**
 * Конфигурация Swagger/OpenAPI
 */

const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const path = require('path')

// Базовая информация об API
const apiInfo = {
  openapi: '3.0.0',
  info: {
    title: 'Contest Aggregator API',
    version: '1.0.0',
    description: 'API для агрегатора конкурсов',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    }
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:3000',
      description: 'API сервер'
    }
  ]
}

// Компоненты безопасности
const securitySchemes = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT'
  }
}

// Общие компоненты
const components = {
  securitySchemes,
  responses: {
    UnauthorizedError: {
      description: 'Ошибка авторизации',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                example: false
              },
              message: {
                type: 'string',
                example: 'Unauthorized'
              }
            }
          }
        }
      }
    },
    ForbiddenError: {
      description: 'Доступ запрещен',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                example: false
              },
              message: {
                type: 'string',
                example: 'Forbidden'
              }
            }
          }
        }
      }
    },
    NotFoundError: {
      description: 'Ресурс не найден',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                example: false
              },
              message: {
                type: 'string',
                example: 'Not Found'
              }
            }
          }
        }
      }
    },
    ServerError: {
      description: 'Внутренняя ошибка сервера',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                example: false
              },
              message: {
                type: 'string',
                example: 'Internal Server Error'
              }
            }
          }
        }
      }
    }
  }
}

// Опции для swagger-jsdoc
const options = {
  definition: {
    ...apiInfo,
    components
  },
  // Пути к файлам с JSDoc комментариями
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../modules/*/routes/*.js'),
    path.join(__dirname, '../modules/*/docs/*.yaml')
  ]
}

// Генерация спецификации
const apiSpec = swaggerJsdoc(options)

// Опции для swagger-ui
const uiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true
  }
}

module.exports = {
  apiSpec,
  uiOptions,
  setup: (app) => {
    // Маршрут для JSON спецификации
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json')
      res.send(apiSpec)
    })

    // Маршрут для Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiSpec, uiOptions))
  }
} 