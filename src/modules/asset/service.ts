import { IPortfolioRepository } from '../portfolio/interfaces'
import {
  IAssetRepository,
  Asset,
  IAssetService,
  CreateAssetRequest,
  UpdateAssetRequest,
  CreateAssetData,
  UpdateAssetData,
} from './interfaces'

export class AssetService implements IAssetService {
  constructor(
    private assetRepository: IAssetRepository,
    private portfolioRepository: IPortfolioRepository
  ) {}

  async getAssetsByPortfolioId(
    portfolioId: string,
    userId: string,
    userToken?: string
  ): Promise<Asset[]> {
    if (!portfolioId || !userId) {
      throw new Error('Portfolio ID and User ID are required')
    }

    // Verify portfolio belongs to user
    const portfolio = await this.portfolioRepository.findById(
      portfolioId,
      userId,
      userToken
    )
    if (!portfolio) {
      throw new Error('Portfolio not found or does not belong to user')
    }

    return await this.assetRepository.findAllByPortfolioId(
      portfolioId,
      userToken
    )
  }

  async getAssetById(
    id: string,
    userId: string,
    userToken?: string
  ): Promise<Asset> {
    if (!id || !userId) {
      throw new Error('Asset ID and User ID are required')
    }

    const asset = await this.assetRepository.findById(id, userId, userToken)
    if (!asset) {
      throw new Error('Asset not found')
    }

    return asset
  }

  async createAsset(
    userId: string,
    data: CreateAssetRequest,
    userToken?: string
  ): Promise<Asset> {
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!data.portfolioId) {
      throw new Error('Portfolio ID is required')
    }

    // Verify portfolio belongs to user
    const portfolio = await this.portfolioRepository.findById(
      data.portfolioId,
      userId,
      userToken
    )
    if (!portfolio) {
      throw new Error('Portfolio not found or does not belong to user')
    }

    if (!data.symbol?.trim()) {
      throw new Error('Symbol is required')
    }

    if (!data.name?.trim()) {
      throw new Error('Asset name is required')
    }

    if (!data.type) {
      throw new Error('Asset type is required')
    }

    if (!data.quantity || data.quantity <= 0) {
      throw new Error('Quantity must be greater than 0')
    }

    if (!data.purchasePrice || data.purchasePrice <= 0) {
      throw new Error('Purchase price must be greater than 0')
    }

    const validTypes = [
      'stock',
      'cryptocurrency',
      'bond',
      'etf',
      'commodity',
      'real_estate',
      'other',
    ]
    if (!validTypes.includes(data.type)) {
      throw new Error(
        `Invalid asset type. Must be one of: ${validTypes.join(', ')}`
      )
    }

    const assetData: CreateAssetData = {
      portfolio_id: data.portfolioId,
      symbol: data.symbol.trim().toUpperCase(),
      name: data.name.trim(),
      type: data.type,
      quantity: data.quantity,
      purchase_price: data.purchasePrice,
      current_price: data.currentPrice || data.purchasePrice,
      purchase_date:
        data.purchaseDate || new Date().toISOString().split('T')[0],
      currency: data.currency || 'USD',
    }

    if (data.exchange?.trim()) {
      assetData.exchange = data.exchange.trim()
    }

    if (data.notes?.trim()) {
      assetData.notes = data.notes.trim()
    }

    return await this.assetRepository.create(assetData, userToken)
  }

  async updateAsset(
    id: string,
    userId: string,
    data: UpdateAssetRequest,
    userToken?: string
  ): Promise<Asset> {
    if (!id || !userId) {
      throw new Error('Asset ID and User ID are required')
    }

    // Check if asset exists and belongs to user
    const existingAsset = await this.assetRepository.findById(
      id,
      userId,
      userToken
    )
    if (!existingAsset) {
      throw new Error('Asset not found')
    }

    const updateData: UpdateAssetData = {}

    if (data.symbol !== undefined) {
      updateData.symbol = data.symbol.trim().toUpperCase()
    }

    if (data.name !== undefined) {
      updateData.name = data.name.trim()
    }

    if (data.type !== undefined) {
      const validTypes = [
        'stock',
        'cryptocurrency',
        'bond',
        'etf',
        'commodity',
        'real_estate',
        'other',
      ]
      if (!validTypes.includes(data.type)) {
        throw new Error(
          `Invalid asset type. Must be one of: ${validTypes.join(', ')}`
        )
      }
      updateData.type = data.type
    }

    if (data.quantity !== undefined) {
      if (data.quantity <= 0) {
        throw new Error('Quantity must be greater than 0')
      }
      updateData.quantity = data.quantity
    }

    if (data.purchasePrice !== undefined) {
      if (data.purchasePrice <= 0) {
        throw new Error('Purchase price must be greater than 0')
      }
      updateData.purchase_price = data.purchasePrice
    }

    if (data.currentPrice !== undefined) {
      if (data.currentPrice <= 0) {
        throw new Error('Current price must be greater than 0')
      }
      updateData.current_price = data.currentPrice
    }

    if (data.purchaseDate !== undefined) {
      updateData.purchase_date = data.purchaseDate
    }

    if (data.exchange !== undefined) {
      const trimmedExchange = data.exchange?.trim()
      if (trimmedExchange) {
        updateData.exchange = trimmedExchange
      }
    }

    if (data.currency !== undefined) {
      updateData.currency = data.currency
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes?.trim()
    }

    return await this.assetRepository.update(id, userId, updateData, userToken)
  }

  async deleteAsset(
    id: string,
    userId: string,
    userToken?: string
  ): Promise<void> {
    if (!id || !userId) {
      throw new Error('Asset ID and User ID are required')
    }

    // Check if asset exists and belongs to user
    const exists = await this.assetRepository.existsInUserPortfolio(
      id,
      userId,
      userToken
    )
    if (!exists) {
      throw new Error('Asset not found')
    }

    await this.assetRepository.delete(id, userId, userToken)
  }
}
