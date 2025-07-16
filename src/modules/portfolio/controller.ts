import { Response } from 'express'
import { IPortfolioService, UpdatePortfolioRequest } from './interfaces'
import { AuthenticatedRequest } from '../../shared/types'

export class PortfolioController {
  constructor(private portfolioService: IPortfolioService) {}

  private extractUserToken(req: AuthenticatedRequest): string | undefined {
    const authHeader = req.headers.authorization
    if (!authHeader) return undefined

    const token = authHeader.split(' ')[1]
    return token || undefined
  }

  getAllPortfolios = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const userToken = this.extractUserToken(req)

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      const portfolios = await this.portfolioService.getAllPortfolios(
        userId,
        userToken
      )

      res.status(200).json({
        success: true,
        data: portfolios,
      })
    } catch (error) {
      console.error('Get portfolios error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  getPortfolioById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const userToken = this.extractUserToken(req)
      const portfolioId = req.params.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      if (!portfolioId) {
        return res.status(400).json({
          success: false,
          error: 'Portfolio ID is required',
        })
      }

      try {
        const portfolio = await this.portfolioService.getPortfolioById(
          portfolioId,
          userId,
          userToken
        )

        res.status(200).json({
          success: true,
          data: portfolio,
        })
      } catch (serviceError: unknown) {
        if (
          serviceError instanceof Error &&
          serviceError.message === 'Portfolio not found'
        ) {
          return res.status(404).json({
            success: false,
            error: 'Portfolio not found',
          })
        }
        throw serviceError
      }
    } catch (error) {
      console.error('Get portfolio error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  createPortfolio = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const userToken = this.extractUserToken(req)
      const { name, description, currency, isDefault } = req.body

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      try {
        const portfolio = await this.portfolioService.createPortfolio(
          userId,
          {
            name,
            description,
            currency,
            isDefault,
          },
          userToken
        )

        res.status(201).json({
          success: true,
          message: 'Portfolio created successfully',
          data: portfolio,
        })
      } catch (serviceError: unknown) {
        if (
          serviceError instanceof Error &&
          (serviceError.message.includes('required') ||
            serviceError.message.includes('name'))
        ) {
          return res.status(400).json({
            success: false,
            error: serviceError.message,
          })
        }
        throw serviceError
      }
    } catch (error) {
      console.error('Create portfolio error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  updatePortfolio = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const userToken = this.extractUserToken(req)
      const portfolioId = req.params.id
      const { name, description, currency, isDefault } = req.body

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      if (!portfolioId) {
        return res.status(400).json({
          success: false,
          error: 'Portfolio ID is required',
        })
      }

      try {
        const updateData: UpdatePortfolioRequest = {
          name,
          description,
          currency,
          isDefault,
        }

        const portfolio = await this.portfolioService.updatePortfolio(
          portfolioId,
          userId,
          updateData,
          userToken
        )

        res.status(200).json({
          success: true,
          message: 'Portfolio updated successfully',
          data: portfolio,
        })
      } catch (serviceError: unknown) {
        if (
          serviceError instanceof Error &&
          serviceError.message === 'Portfolio not found'
        ) {
          return res.status(404).json({
            success: false,
            error: 'Portfolio not found',
          })
        }
        throw serviceError
      }
    } catch (error) {
      console.error('Update portfolio error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  deletePortfolio = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const userToken = this.extractUserToken(req)
      const portfolioId = req.params.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      if (!portfolioId) {
        return res.status(400).json({
          success: false,
          error: 'Portfolio ID is required',
        })
      }

      try {
        await this.portfolioService.deletePortfolio(
          portfolioId,
          userId,
          userToken
        )

        res.status(200).json({
          success: true,
          message: 'Portfolio deleted successfully',
        })
      } catch (serviceError: unknown) {
        if (
          serviceError instanceof Error &&
          serviceError.message === 'Portfolio not found'
        ) {
          return res.status(404).json({
            success: false,
            error: 'Portfolio not found',
          })
        }
        throw serviceError
      }
    } catch (error) {
      console.error('Delete portfolio error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }
}
