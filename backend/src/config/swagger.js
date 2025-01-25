const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Загружаем документацию API для каждого модуля
const youtubeApiDoc = YAML.load(path.join(__dirname, '../modules/youtube/docs/api.yaml'));

// Объединяем все спецификации
const apiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Contest Platform API',
    description: 'API документация для платформы конкурсов',
    version: '1.0.0'
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API версии 1'
    }
  ],
  security: [
    {
      bearerAuth: []
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    ...youtubeApiDoc.paths
  },
  components: {
    ...youtubeApiDoc.components
  }
};

const swaggerOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Contest Platform API Documentation"
};

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(apiSpec, swaggerOptions)
}; 