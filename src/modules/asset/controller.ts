import { Response } from 'express'
import { AuthenticatedRequest } from '../../shared/types'
import { AssetService } from './service'
import { UpdateAssetRequest, CreateAssetRequest } from './interfaces'

export class AssetController {
  constructor(private assetService: AssetService) {}

  getAssetsByPortfolioId = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const { portfolioId } = req.query

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      if (!portfolioId || typeof portfolioId !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Portfolio ID is required',
        })
      }

      try {
        const assets = await this.assetService.getAssetsByPortfolioId(
          portfolioId,
          userId
        )

        res.status(200).json({
          success: true,
          data: assets,
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
      console.error('Get assets error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  getAssetById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const assetId = req.params.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      if (!assetId) {
        return res.status(400).json({
          success: false,
          error: 'Asset ID is required',
        })
      }

      try {
        const asset = await this.assetService.getAssetById(assetId, userId)

        res.status(200).json({
          success: true,
          data: asset,
        })
      } catch (serviceError: unknown) {
        if (
          serviceError instanceof Error &&
          serviceError.message === 'Asset not found'
        ) {
          return res.status(404).json({
            success: false,
            error: 'Asset not found',
          })
        }
        throw serviceError
      }
    } catch (error) {
      console.error('Get asset error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  createAsset = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const {
        portfolioId,
        symbol,
        name,
        type,
        quantity,
        purchasePrice,
        currentPrice,
        purchaseDate,
        exchange,
        currency,
        notes,
      } = req.body

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      try {
        const createData: CreateAssetRequest = {
          portfolioId,
          symbol,
          name,
          type,
          quantity: parseFloat(quantity),
          purchasePrice: parseFloat(purchasePrice),
          purchaseDate,
          exchange,
          currency,
          notes,
        }

        if (currentPrice) {
          createData.currentPrice = parseFloat(currentPrice)
        }

        const asset = await this.assetService.createAsset(userId, createData)

        res.status(201).json({
          success: true,
          message: 'Asset created successfully',
          data: asset,
        })
      } catch (serviceError: unknown) {
        if (
          serviceError instanceof Error &&
          (serviceError.message.includes('required') ||
            serviceError.message.includes('must be greater') ||
            serviceError.message.includes('Portfolio not found'))
        ) {
          return res.status(400).json({
            success: false,
            error: serviceError.message,
          })
        }
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
      console.error('Create asset error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  updateAsset = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const assetId = req.params.id
      const {
        symbol,
        name,
        type,
        quantity,
        purchasePrice,
        currentPrice,
        purchaseDate,
        exchange,
        currency,
        notes,
      } = req.body

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      if (!assetId) {
        return res.status(400).json({
          success: false,
          error: 'Asset ID is required',
        })
      }

      try {
        const updateData: UpdateAssetRequest = {}
        if (symbol !== undefined) updateData.symbol = symbol
        if (name !== undefined) updateData.name = name
        if (type !== undefined) updateData.type = type
        if (quantity !== undefined) updateData.quantity = parseFloat(quantity)
        if (purchasePrice !== undefined)
          updateData.purchasePrice = parseFloat(purchasePrice)
        if (currentPrice !== undefined)
          updateData.currentPrice = parseFloat(currentPrice)
        if (purchaseDate !== undefined) updateData.purchaseDate = purchaseDate
        if (exchange !== undefined) updateData.exchange = exchange
        if (currency !== undefined) updateData.currency = currency
        if (notes !== undefined) updateData.notes = notes

        const asset = await this.assetService.updateAsset(
          assetId,
          userId,
          updateData
        )

        res.status(200).json({
          success: true,
          message: 'Asset updated successfully',
          data: asset,
        })
      } catch (serviceError: unknown) {
        if (
          serviceError instanceof Error &&
          serviceError.message === 'Asset not found'
        ) {
          return res.status(404).json({
            success: false,
            error: 'Asset not found',
          })
        }
        if (
          serviceError instanceof Error &&
          serviceError.message.includes('must be greater')
        ) {
          return res.status(400).json({
            success: false,
            error: serviceError.message,
          })
        }
        throw serviceError
      }
    } catch (error) {
      console.error('Update asset error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  deleteAsset = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const assetId = req.params.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      if (!assetId) {
        return res.status(400).json({
          success: false,
          error: 'Asset ID is required',
        })
      }

      try {
        await this.assetService.deleteAsset(assetId, userId)

        res.status(200).json({
          success: true,
          message: 'Asset deleted successfully',
        })
      } catch (serviceError: unknown) {
        if (
          serviceError instanceof Error &&
          serviceError.message === 'Asset not found'
        ) {
          return res.status(404).json({
            success: false,
            error: 'Asset not found',
          })
        }
        throw serviceError
      }
    } catch (error) {
      console.error('Delete asset error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }
}
