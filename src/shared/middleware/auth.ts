import { Response, NextFunction } from 'express'
import { supabase } from '../config/config'
import { AuthenticatedRequest, User } from '../types'

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No authorization header provided',
      })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      })
    }

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      })
    }

    // Transform Supabase user to our User type
    const authenticatedUser: User = {
      id: user.id,
      email: user.email || '',
      username: user.user_metadata?.username || user.email?.split('@')[0] || '',
      firstName: user.user_metadata?.first_name,
      lastName: user.user_metadata?.last_name,
      avatarUrl: user.user_metadata?.avatar_url,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at || user.created_at),
    }

    req.user = authenticatedUser
    return next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authentication',
    })
  }
}

export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return next()
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      return next()
    }

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (!error && user) {
      const authenticatedUser: User = {
        id: user.id,
        email: user.email || '',
        username:
          user.user_metadata?.username || user.email?.split('@')[0] || '',
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name,
        avatarUrl: user.user_metadata?.avatar_url,
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at || user.created_at),
      }

      req.user = authenticatedUser
    }

    next()
  } catch (error) {
    console.error('Optional auth middleware error:', error)
    next()
  }
}
