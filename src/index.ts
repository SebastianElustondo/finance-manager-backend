import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { apiReference } from '@scalar/express-api-reference'

// Import routes
import authRoutes from './routes/auth'
import portfolioRoutes from './modules/portfolio/routes'
import assetRoutes from './modules/asset/routes'
import alertRoutes from './modules/alert/routes'

// Import middleware
import { errorHandler } from './shared/middleware/errorHandler'
import { requestLogger } from './shared/middleware/requestLogger'
import { authMiddleware } from './shared/middleware/auth'

// Import API documentation
import { swaggerSpec } from './shared/config/swagger'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)

// Security middleware
app.use(helmet())
app.use(compression())

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
)

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging
app.use(requestLogger)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
  })
})

// API routes
const apiVersion = process.env.API_VERSION || 'v1'
app.use(`/api/${apiVersion}/auth`, authRoutes)
app.use(`/api/${apiVersion}/portfolio`, authMiddleware, portfolioRoutes)
app.use(`/api/${apiVersion}/assets`, authMiddleware, assetRoutes)
app.use(`/api/${apiVersion}/alerts`, authMiddleware, alertRoutes)

// API Documentation
app.use(
  '/api/docs',
  apiReference({
    spec: {
      content: swaggerSpec,
    },
    theme: 'purple',
    layout: 'modern',
    showSidebar: true,
    hideDownloadButton: false,
    authentication: {
      preferredSecurityScheme: 'bearerAuth',
      bearerToken: 'your-bearer-token-here',
    },
  })
)

// JSON spec endpoint
app.get('/api/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  })
})

// Error handling middleware
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`🚀 Finance Manager API Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 API Version: ${apiVersion}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully...')
  server.close(() => {
    console.log('💤 Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully...')
  server.close(() => {
    console.log('💤 Process terminated')
    process.exit(0)
  })
})

export default app
