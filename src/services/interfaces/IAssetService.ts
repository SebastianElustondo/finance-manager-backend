import { Asset } from '../../repositories/interfaces/IAssetRepository'

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
  getAssetsByPortfolioId(portfolioId: string, userId: string): Promise<Asset[]>
  getAssetById(id: string, userId: string): Promise<Asset>
  createAsset(userId: string, data: CreateAssetRequest): Promise<Asset>
  updateAsset(id: string, userId: string, data: UpdateAssetRequest): Promise<Asset>
  deleteAsset(id: string, userId: string): Promise<void>
} 