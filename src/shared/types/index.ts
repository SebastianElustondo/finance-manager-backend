import { Request } from 'express'

// User types
export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

// Portfolio types
export interface Portfolio {
  id: string
  userId: string
  name: string
  description?: string
  totalValue: number
  currency: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// Asset types
export enum AssetType {
  STOCK = 'stock',
  CRYPTOCURRENCY = 'cryptocurrency',
  BOND = 'bond',
  ETF = 'etf',
  COMMODITY = 'commodity',
  REAL_ESTATE = 'real_estate',
  OTHER = 'other',
}

export interface Asset {
  id: string
  portfolioId: string
  symbol: string
  name: string
  type: AssetType
  quantity: number
  purchasePrice: number
  currentPrice: number
  purchaseDate: Date
  exchange?: string
  currency: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Transaction types
export enum TransactionType {
  BUY = 'buy',
  SELL = 'sell',
  DIVIDEND = 'dividend',
  SPLIT = 'split',
  TRANSFER = 'transfer',
}

export interface Transaction {
  id: string
  portfolioId: string
  assetId: string
  type: TransactionType
  quantity: number
  price: number
  totalAmount: number
  fees: number
  date: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Alert types
export enum AlertType {
  PRICE_ABOVE = 'price_above',
  PRICE_BELOW = 'price_below',
  PERCENT_CHANGE = 'percent_change',
  VOLUME_SPIKE = 'volume_spike',
  NEWS = 'news',
}

export interface Alert {
  id: string
  userId: string
  symbol: string
  type: AlertType
  condition: number
  isActive: boolean
  isTriggered: boolean
  message: string
  createdAt: Date
  updatedAt: Date
  triggeredAt?: Date
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T = unknown> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Request types
export interface AuthenticatedRequest extends Request {
  user?: User
}

export interface QueryParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
}

// External API types
export interface AlphaVantageResponse {
  'Global Quote': {
    '01. symbol': string
    '05. price': string
    '09. change': string
    '10. change percent': string
  }
}

export interface CoinGeckoResponse {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  total_volume: number
}

// Database models
export interface DatabaseUser {
  id: string
  email: string
  username: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface DatabaseAsset {
  id: string
  portfolio_id: string
  symbol: string
  name: string
  type: AssetType
  quantity: number
  purchase_price: number
  current_price: number
  purchase_date: string
  exchange?: string
  currency: string
  notes?: string
  created_at: string
  updated_at: string
}

// Error types
export interface AppError extends Error {
  statusCode: number
  isOperational: boolean
}

export interface ValidationError {
  field: string
  message: string
  value: unknown
}
