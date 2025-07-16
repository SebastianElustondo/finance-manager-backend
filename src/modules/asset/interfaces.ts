// Repository interfaces
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
  findAllByPortfolioId(
    portfolioId: string,
    userToken?: string
  ): Promise<Asset[]>
  findById(
    id: string,
    userId: string,
    userToken?: string
  ): Promise<Asset | null>
  create(data: CreateAssetData, userToken?: string): Promise<Asset>
  update(
    id: string,
    userId: string,
    data: UpdateAssetData,
    userToken?: string
  ): Promise<Asset>
  delete(id: string, userId: string, userToken?: string): Promise<void>
  existsInUserPortfolio(
    id: string,
    userId: string,
    userToken?: string
  ): Promise<boolean>
}

// Service interfaces
export interface CreateAssetRequest {
  portfolioId: string
  symbol: string
  name: string
  type: string
  quantity: number
  purchasePrice: number
  currentPrice?: number
  purchaseDate?: string
  exchange?: string
  currency?: string
  notes?: string
}

export interface UpdateAssetRequest {
  symbol?: string
  name?: string
  type?: string
  quantity?: number
  purchasePrice?: number
  currentPrice?: number
  purchaseDate?: string
  exchange?: string
  currency?: string
  notes?: string
}

export interface IAssetService {
  getAssetsByPortfolioId(
    portfolioId: string,
    userId: string,
    userToken?: string
  ): Promise<Asset[]>
  getAssetById(id: string, userId: string, userToken?: string): Promise<Asset>
  createAsset(
    userId: string,
    data: CreateAssetRequest,
    userToken?: string
  ): Promise<Asset>
  updateAsset(
    id: string,
    userId: string,
    data: UpdateAssetRequest,
    userToken?: string
  ): Promise<Asset>
  deleteAsset(id: string, userId: string, userToken?: string): Promise<void>
}
