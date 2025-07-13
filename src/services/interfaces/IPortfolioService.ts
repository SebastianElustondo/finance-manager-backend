import { Portfolio } from '../../repositories/interfaces/IPortfolioRepository'

export interface CreatePortfolioRequest {
  name: string
  description?: string
  currency?: string
  isDefault?: boolean
}

export interface UpdatePortfolioRequest {
  name?: string
  description?: string
  currency?: string
  isDefault?: boolean
}

export interface IPortfolioService {
  getAllPortfolios(userId: string): Promise<Portfolio[]>
  getPortfolioById(id: string, userId: string): Promise<Portfolio>
  createPortfolio(userId: string, data: CreatePortfolioRequest): Promise<Portfolio>
  updatePortfolio(id: string, userId: string, data: UpdatePortfolioRequest): Promise<Portfolio>
  deletePortfolio(id: string, userId: string): Promise<void>
} 