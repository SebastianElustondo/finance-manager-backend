export interface CreateAssetData {
  portfolio_id: string
  symbol: string
  name: string
  type: string
  quantity: number
  purchase_price: number
  current_price: number
  purchase_date: string
  exchange?: string
  currency: string
  notes?: string
}

export interface UpdateAssetData {
  symbol?: string
  name?: string
  type?: string
  quantity?: number
  purchase_price?: number
  current_price?: number
  purchase_date?: string
  exchange?: string
  currency?: string
  notes?: string
}

export interface Asset {
  id: string
  portfolio_id: string
  symbol: string
  name: string
  type: string
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

export interface IAssetRepository {
  findAllByPortfolioId(portfolioId: string): Promise<Asset[]>
  findById(id: string, userId: string): Promise<Asset | null>
  create(data: CreateAssetData): Promise<Asset>
  update(id: string, userId: string, data: UpdateAssetData): Promise<Asset>
  delete(id: string, userId: string): Promise<void>
  existsInUserPortfolio(id: string, userId: string): Promise<boolean>
} 