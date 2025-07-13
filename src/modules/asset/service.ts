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
    userId: string
  ): Promise<Asset[]> {
    if (!portfolioId || !userId) {
      throw new Error('Portfolio ID and User ID are required')
    }

    // Verify portfolio belongs to user
    const portfolioExists = await this.portfolioRepository.exists(
      portfolioId,
      userId
    )
    if (!portfolioExists) {
      throw new Error('Portfolio not found')
    }

    return await this.assetRepository.findAllByPortfolioId(portfolioId)
  }

  async getAssetById(id: string, userId: string): Promise<Asset> {
    if (!id || !userId) {
      throw new Error('Asset ID and User ID are required')
    }

    const asset = await this.assetRepository.findById(id, userId)
    if (!asset) {
      throw new Error('Asset not found')
    }

    return asset
  }

  async createAsset(userId: string, data: CreateAssetRequest): Promise<Asset> {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Validate required fields
    if (
      !data.portfolioId ||
      !data.symbol ||
      !data.name ||
      !data.type ||
      data.quantity === undefined ||
      data.purchasePrice === undefined
    ) {
      throw new Error(
        'Required fields: portfolioId, symbol, name, type, quantity, purchasePrice'
      )
    }

    if (data.quantity <= 0) {
      throw new Error('Quantity must be greater than 0')
    }

    if (data.purchasePrice <= 0) {
      throw new Error('Purchase price must be greater than 0')
    }

    // Verify portfolio belongs to user
    const portfolioExists = await this.portfolioRepository.exists(
      data.portfolioId,
      userId
    )
    if (!portfolioExists) {
      throw new Error('Portfolio not found')
    }

    const assetData: CreateAssetData = {
      portfolio_id: data.portfolioId,
      symbol: data.symbol.toUpperCase(),
      name: data.name.trim(),
      type: data.type,
      quantity: data.quantity,
      purchase_price: data.purchasePrice,
      current_price: data.currentPrice || data.purchasePrice,
      purchase_date: data.purchaseDate || new Date().toISOString(),
      currency: data.currency || 'USD',
    }

    if (data.exchange?.trim()) {
      assetData.exchange = data.exchange.trim()
    }

    if (data.notes?.trim()) {
      assetData.notes = data.notes.trim()
    }

    return await this.assetRepository.create(assetData)
  }

  async updateAsset(
    id: string,
    userId: string,
    data: UpdateAssetRequest
  ): Promise<Asset> {
    if (!id || !userId) {
      throw new Error('Asset ID and User ID are required')
    }

    // Check if asset exists and belongs to user's portfolio
    const exists = await this.assetRepository.existsInUserPortfolio(id, userId)
    if (!exists) {
      throw new Error('Asset not found')
    }

    // Validate updated fields
    if (data.quantity !== undefined && data.quantity <= 0) {
      throw new Error('Quantity must be greater than 0')
    }

    if (data.purchasePrice !== undefined && data.purchasePrice <= 0) {
      throw new Error('Purchase price must be greater than 0')
    }

    if (data.currentPrice !== undefined && data.currentPrice <= 0) {
      throw new Error('Current price must be greater than 0')
    }

    const updateData: UpdateAssetData = {}
    if (data.symbol !== undefined) updateData.symbol = data.symbol.toUpperCase()
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.type !== undefined) updateData.type = data.type
    if (data.quantity !== undefined) updateData.quantity = data.quantity
    if (data.purchasePrice !== undefined)
      updateData.purchase_price = data.purchasePrice
    if (data.currentPrice !== undefined)
      updateData.current_price = data.currentPrice
    if (data.purchaseDate !== undefined)
      updateData.purchase_date = data.purchaseDate
    if (data.currency !== undefined) updateData.currency = data.currency

    if (data.exchange !== undefined) {
      const trimmedExchange = data.exchange?.trim()
      if (trimmedExchange) {
        updateData.exchange = trimmedExchange
      }
    }

    if (data.notes !== undefined) {
      const trimmedNotes = data.notes?.trim()
      if (trimmedNotes) {
        updateData.notes = trimmedNotes
      }
    }

    return await this.assetRepository.update(id, userId, updateData)
  }

  async deleteAsset(id: string, userId: string): Promise<void> {
    if (!id || !userId) {
      throw new Error('Asset ID and User ID are required')
    }

    // Check if asset exists and belongs to user's portfolio
    const exists = await this.assetRepository.existsInUserPortfolio(id, userId)
    if (!exists) {
      throw new Error('Asset not found')
    }

    await this.assetRepository.delete(id, userId)
  }
}
