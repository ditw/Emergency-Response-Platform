const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Emergency Response API',
    version: '1.0.0',
    description: 'API documentation for the Emergency Response platform.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ]
};

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, 'server.js')], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;