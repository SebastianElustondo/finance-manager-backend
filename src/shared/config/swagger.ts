import swaggerJSDoc from 'swagger-jsdoc'

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Manager API',
      version: '1.0.0',
      description:
        'A comprehensive financial portfolio management API for tracking investments across different asset classes.',
      contact: {
        name: 'Finance Manager Team',
        email: 'contact@financemanager.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.financemanager.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // User schemas
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            username: {
              type: 'string',
              description: 'User username',
            },
            firstName: {
              type: 'string',
              description: 'User first name',
            },
            lastName: {
              type: 'string',
              description: 'User last name',
            },
            avatarUrl: {
              type: 'string',
              format: 'uri',
              description: 'User avatar URL',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp',
            },
          },
        },

        // Portfolio schemas
        Portfolio: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique portfolio identifier',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'Portfolio owner ID',
            },
            name: {
              type: 'string',
              description: 'Portfolio name',
            },
            description: {
              type: 'string',
              description: 'Portfolio description',
            },
            totalValue: {
              type: 'number',
              description: 'Total portfolio value',
            },
            currency: {
              type: 'string',
              description: 'Portfolio currency',
              enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'],
            },
            isDefault: {
              type: 'boolean',
              description: 'Whether this is the default portfolio',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Portfolio creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Portfolio last update timestamp',
            },
          },
        },

        // Asset schemas
        Asset: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique asset identifier',
            },
            portfolioId: {
              type: 'string',
              format: 'uuid',
              description: 'Portfolio ID this asset belongs to',
            },
            symbol: {
              type: 'string',
              description: 'Asset symbol (e.g., AAPL, BTC)',
            },
            name: {
              type: 'string',
              description: 'Asset name',
            },
            type: {
              type: 'string',
              description: 'Asset type',
              enum: [
                'stock',
                'cryptocurrency',
                'bond',
                'etf',
                'commodity',
                'real_estate',
                'other',
              ],
            },
            quantity: {
              type: 'number',
              description: 'Asset quantity',
            },
            purchasePrice: {
              type: 'number',
              description: 'Purchase price per unit',
            },
            currentPrice: {
              type: 'number',
              description: 'Current market price per unit',
            },
            purchaseDate: {
              type: 'string',
              format: 'date',
              description: 'Purchase date',
            },
            exchange: {
              type: 'string',
              description: 'Exchange where asset is traded',
            },
            currency: {
              type: 'string',
              description: 'Asset currency',
            },
            notes: {
              type: 'string',
              description: 'Additional notes about the asset',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Asset creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Asset last update timestamp',
            },
          },
        },

        // Alert schemas
        Alert: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique alert identifier',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'Alert owner ID',
            },
            symbol: {
              type: 'string',
              description: 'Asset symbol to watch',
            },
            type: {
              type: 'string',
              description: 'Alert type',
              enum: [
                'price_above',
                'price_below',
                'percent_change',
                'volume_spike',
                'news',
              ],
            },
            condition: {
              type: 'number',
              description: 'Alert condition value',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether alert is active',
            },
            isTriggered: {
              type: 'boolean',
              description: 'Whether alert has been triggered',
            },
            message: {
              type: 'string',
              description: 'Alert message',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Alert creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Alert last update timestamp',
            },
            triggeredAt: {
              type: 'string',
              format: 'date-time',
              description: 'Alert trigger timestamp',
            },
          },
        },

        // Common response schemas
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the request was successful',
            },
            data: {
              description: 'Response data',
            },
            message: {
              type: 'string',
              description: 'Response message',
            },
            error: {
              type: 'string',
              description: 'Error message if request failed',
            },
          },
        },

        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'string',
              description: 'Additional error details (development only)',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/modules/*/routes.ts', // Include all module routes
    './src/routes/*.ts', // Include all route files
    './src/modules/*/controller.ts', // Include all controllers
  ],
}

export const swaggerSpec = swaggerJSDoc(swaggerOptions)
export default swaggerSpec
