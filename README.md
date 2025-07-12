# Finance Manager Backend

A robust Node.js/Express backend API for the Finance Manager application with TypeScript, Supabase integration, and real-time WebSocket support.

## Features

- **RESTful API** with Express.js and TypeScript
- **Authentication** with Supabase Auth
- **Database** integration with Supabase PostgreSQL
- **Real-time updates** via WebSocket connections
- **Rate limiting** and security middleware
- **Comprehensive error handling**
- **Request logging** and monitoring
- **TypeScript** for type safety

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Supabase** - Database and authentication
- **WebSocket** - Real-time communication
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers (future use)
├── middleware/      # Express middleware
├── models/          # Database models (future use)
├── routes/          # API routes
├── services/        # Business logic services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── index.ts         # Main application entry point
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables in `.env`:**
   ```
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Supabase Configuration
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # JWT Configuration
   JWT_SECRET=your-jwt-secret

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

## Getting Started

### Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix linting errors
npm run lint:fix
```

## API Documentation

### Authentication Routes (`/api/v1/auth`)

- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /refresh` - Refresh access token

### Portfolio Routes (`/api/v1/portfolio`)

- `GET /` - Get all portfolios
- `GET /:id` - Get portfolio by ID
- `POST /` - Create new portfolio
- `PUT /:id` - Update portfolio
- `DELETE /:id` - Delete portfolio

### Asset Routes (`/api/v1/assets`)

- `GET /` - Get assets (requires portfolioId query parameter)
- `POST /` - Create new asset
- `PUT /:id` - Update asset
- `DELETE /:id` - Delete asset

### Price Routes (`/api/v1/prices`)

- `GET /current/:symbol` - Get current price for symbol
- `GET /history/:symbol` - Get historical prices
- `POST /batch` - Get prices for multiple symbols

### Alert Routes (`/api/v1/alerts`)

- `GET /` - Get all alerts
- `POST /` - Create new alert
- `PUT /:id` - Update alert
- `DELETE /:id` - Delete alert

### Utility Routes

- `GET /health` - Health check endpoint

## WebSocket API

Connect to WebSocket server for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:3001');

// Authentication
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your-jwt-token'
}));

// Subscribe to price updates
ws.send(JSON.stringify({
  type: 'subscribe',
  symbols: ['AAPL', 'GOOGL', 'BTC']
}));

// Handle incoming messages
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

## Database Schema

The application uses Supabase PostgreSQL with the following main tables:

- `users` - User profiles (managed by Supabase Auth)
- `portfolios` - User portfolios
- `assets` - Portfolio assets
- `transactions` - Asset transactions
- `alerts` - Price alerts
- `price_history` - Historical price data

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `SUPABASE_URL` | Supabase project URL | - |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | - |
| `JWT_SECRET` | JWT signing secret | - |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Request validation
- **Error Handling** - Secure error responses

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional details (development only)"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## License

This project is licensed under the MIT License. 