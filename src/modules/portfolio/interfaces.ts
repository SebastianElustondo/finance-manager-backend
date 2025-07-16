// Repository interfaces
export interface CreatePortfolioData {
  user_id: string
  name: string
  description?: string
  currency: string
  is_default: boolean
  total_value?: number
}

export interface UpdatePortfolioData {
  name?: string
  description?: string
  currency?: string
  is_default?: boolean
  total_value?: number
}

export interface Portfolio {
  id: string
  user_id: string
  name: string
  description?: string
  total_value: number
  currency: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface IPortfolioRepository {
  findAllByUserId(userId: string, userToken?: string): Promise<Portfolio[]>
  findById(
    id: string,
    userId: string,
    userToken?: string
  ): Promise<Portfolio | null>
  create(data: CreatePortfolioData, userToken?: string): Promise<Portfolio>
  update(
    id: string,
    userId: string,
    data: UpdatePortfolioData,
    userToken?: string
  ): Promise<Portfolio>
  delete(id: string, userId: string, userToken?: string): Promise<void>
  setAllDefaultToFalse(userId: string, userToken?: string): Promise<void>
  exists(id: string, userId: string, userToken?: string): Promise<boolean>
}

// Service interfaces
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
  getAllPortfolios(userId: string, userToken?: string): Promise<Portfolio[]>
  getPortfolioById(
    id: string,
    userId: string,
    userToken?: string
  ): Promise<Portfolio>
  createPortfolio(
    userId: string,
    data: CreatePortfolioRequest,
    userToken?: string
  ): Promise<Portfolio>
  updatePortfolio(
    id: string,
    userId: string,
    data: UpdatePortfolioRequest,
    userToken?: string
  ): Promise<Portfolio>
  deletePortfolio(id: string, userId: string, userToken?: string): Promise<void>
}
