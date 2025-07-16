# API Documentation

This directory contains the generated API documentation for the Finance Manager backend.

## 🚀 Quick Start

### View Interactive Documentation

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open your browser and visit:

   ```
   http://localhost:3001/api/docs
   ```

3. You'll see the beautiful Scalar API documentation interface with:
   - Interactive API testing
   - Request/response examples
   - Schema definitions
   - Authentication support

### Generate OpenAPI Specification

To generate the OpenAPI JSON file:

```bash
npm run docs:generate
```

This creates `docs/openapi.json` with the complete API specification.

## 📚 Documentation Features

### ✅ What's Included

- **Interactive API Explorer** - Test endpoints directly in the browser
- **Authentication Support** - JWT Bearer token authentication
- **Request/Response Examples** - Real examples for every endpoint
- **Schema Definitions** - Complete data models
- **Error Handling** - Detailed error responses
- **Tags & Organization** - Endpoints grouped by functionality

### 🎨 Scalar Features

- **Modern UI** - Clean, responsive design
- **Dark/Light Mode** - Automatic theme switching
- **Try It Out** - Interactive API testing
- **Code Examples** - Generated code snippets
- **Search & Filter** - Find endpoints quickly
- **Authentication** - Built-in JWT token management

## 📖 Available Endpoints

### Portfolio Management

- `GET /api/v1/portfolio` - Get all portfolios
- `GET /api/v1/portfolio/{id}` - Get portfolio by ID
- `POST /api/v1/portfolio` - Create new portfolio
- `PUT /api/v1/portfolio/{id}` - Update portfolio
- `DELETE /api/v1/portfolio/{id}` - Delete portfolio

### Asset Management

- `GET /api/v1/assets` - Get all assets
- `POST /api/v1/assets` - Create new asset
- `PUT /api/v1/assets/{id}` - Update asset
- `DELETE /api/v1/assets/{id}` - Delete asset

### Alert Management

- `GET /api/v1/alerts` - Get all alerts
- `POST /api/v1/alerts` - Create new alert
- `PUT /api/v1/alerts/{id}` - Update alert
- `DELETE /api/v1/alerts/{id}` - Delete alert

### Authentication

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - User logout

## 🔧 Adding Documentation

To add documentation to new endpoints, use JSDoc comments in your route files:

```typescript
/**
 * @swagger
 * /api/v1/your-endpoint:
 *   get:
 *     summary: Brief description
 *     description: Detailed description
 *     tags: [YourTag]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YourSchema'
 */
router.get('/your-endpoint', yourController.yourMethod)
```

## 🛠️ Configuration

The documentation configuration is in `src/shared/config/swagger.ts`:

- **Server URLs** - Development and production
- **Authentication** - JWT Bearer token setup
- **Schema definitions** - Data models
- **API information** - Title, description, version

## 🔍 Troubleshooting

### Common Issues

1. **Documentation not updating**
   - Restart the development server
   - Check JSDoc syntax in route files

2. **Authentication not working**
   - Ensure JWT token is valid
   - Check bearer token format

3. **Schema errors**
   - Verify schema definitions in swagger.ts
   - Check references to components/schemas

### Getting Help

- Check the browser console for errors
- Verify the OpenAPI spec at `/api/openapi.json`
- Ensure all route files are included in swagger.ts

## 🎯 Best Practices

1. **Keep Documentation Updated** - Update docs when adding/changing endpoints
2. **Use Examples** - Include realistic request/response examples
3. **Organize with Tags** - Group related endpoints together
4. **Document Errors** - Include all possible error responses
5. **Use Schemas** - Reference shared schemas for consistency

## 📝 Next Steps

1. Add documentation to remaining endpoints (assets, alerts, auth)
2. Add request/response examples
3. Include authentication flow documentation
4. Add error code documentation
5. Create integration examples

The documentation is now ready to use! 🎉
