import {
  IPortfolioRepository,
  Portfolio,
  IPortfolioService,
  CreatePortfolioRequest,
  UpdatePortfolioRequest,
  CreatePortfolioData,
  UpdatePortfolioData,
} from './interfaces'

export class PortfolioService implements IPortfolioService {
  constructor(private portfolioRepository: IPortfolioRepository) {}

  async getAllPortfolios(
    userId: string,
    userToken?: string
  ): Promise<Portfolio[]> {
    if (!userId) {
      throw new Error('User ID is required')
    }

    return await this.portfolioRepository.findAllByUserId(userId, userToken)
  }

  async getPortfolioById(
    id: string,
    userId: string,
    userToken?: string
  ): Promise<Portfolio> {
    if (!id || !userId) {
      throw new Error('Portfolio ID and User ID are required')
    }

    const portfolio = await this.portfolioRepository.findById(
      id,
      userId,
      userToken
    )
    if (!portfolio) {
      throw new Error('Portfolio not found')
    }

    return portfolio
  }

  async createPortfolio(
    userId: string,
    data: CreatePortfolioRequest,
    userToken?: string
  ): Promise<Portfolio> {
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!data.name?.trim()) {
      throw new Error('Portfolio name is required')
    }

    // If this is set as default, update all other portfolios to not be default
    if (data.isDefault) {
      await this.portfolioRepository.setAllDefaultToFalse(userId, userToken)
    }

    const portfolioData: CreatePortfolioData = {
      user_id: userId,
      name: data.name.trim(),
      currency: data.currency || 'USD',
      is_default: data.isDefault || false,
      total_value: 0,
    }

    if (data.description?.trim()) {
      portfolioData.description = data.description.trim()
    }

    return await this.portfolioRepository.create(portfolioData, userToken)
  }

  async updatePortfolio(
    id: string,
    userId: string,
    data: UpdatePortfolioRequest,
    userToken?: string
  ): Promise<Portfolio> {
    if (!id || !userId) {
      throw new Error('Portfolio ID and User ID are required')
    }

    // Check if portfolio exists and belongs to user
    const exists = await this.portfolioRepository.exists(id, userId, userToken)
    if (!exists) {
      throw new Error('Portfolio not found')
    }

    // If this is set as default, update all other portfolios to not be default
    if (data.isDefault) {
      await this.portfolioRepository.setAllDefaultToFalse(userId, userToken)
    }

    const updateData: UpdatePortfolioData = {}
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.description !== undefined)
      updateData.description = data.description?.trim()
    if (data.currency !== undefined) updateData.currency = data.currency
    if (data.isDefault !== undefined) updateData.is_default = data.isDefault

    return await this.portfolioRepository.update(
      id,
      userId,
      updateData,
      userToken
    )
  }

  async deletePortfolio(
    id: string,
    userId: string,
    userToken?: string
  ): Promise<void> {
    if (!id || !userId) {
      throw new Error('Portfolio ID and User ID are required')
    }

    // Check if portfolio exists and belongs to user
    const exists = await this.portfolioRepository.exists(id, userId, userToken)
    if (!exists) {
      throw new Error('Portfolio not found')
    }

    await this.portfolioRepository.delete(id, userId, userToken)
  }
}
