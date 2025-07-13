import { Request, Response, NextFunction } from 'express'

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now()

  // Log request
  console.log(
    `📨 ${req.method} ${req.originalUrl} - ${req.ip} - ${new Date().toISOString()}`
  )

  // Log request body for non-GET requests (excluding sensitive data)
  if (req.method !== 'GET' && req.body) {
    const sanitizedBody = { ...req.body }

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth']
    sensitiveFields.forEach(field => {
      if (sanitizedBody[field]) {
        sanitizedBody[field] = '[REDACTED]'
      }
    })

    console.log(`📋 Request Body:`, sanitizedBody)
  }

  // Log response
  const originalSend = res.send
  res.send = function (body) {
    const duration = Date.now() - startTime
    console.log(
      `📤 ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
    )

    // Log response body for errors (excluding sensitive data)
    if (res.statusCode >= 400) {
      try {
        const responseBody = typeof body === 'string' ? JSON.parse(body) : body
        console.log(`❌ Error Response:`, responseBody)
      } catch {
        console.log(`❌ Error Response:`, body)
      }
    }

    return originalSend.call(this, body)
  }

  next()
}
