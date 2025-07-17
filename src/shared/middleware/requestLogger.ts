import { Request, Response, NextFunction } from 'express'

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now()

  console.log(
    `📨 ${req.method} ${req.originalUrl} - ${req.ip} - ${new Date().toISOString()}`
  )

  const originalSend = res.send
  res.send = function (body) {
    const duration = Date.now() - startTime
    console.log(
      `📤 ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
    )

    return originalSend.call(this, body)
  }

  next()
}
