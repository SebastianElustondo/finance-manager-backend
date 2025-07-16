import { Response } from 'express'
import { AuthenticatedRequest } from '../../shared/types'
import {
  IAssetService,
  UpdateAssetRequest,
  CreateAssetRequest,
} from './interfaces'

export class AssetController {
  constructor(private assetService: IAssetService) {}

  private extractUserToken(req: AuthenticatedRequest): string | undefined {
    const authHeader = req.headers.authorization
    if (!authHeader) return undefined

    const token = authHeader.split(' ')[1]
    return token || undefined
  }

  getAssetsByPortfolioId = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const userToken = this.extractUserToken(req)
      const portfolioId = req.query.portfolioId as string

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
        const assets = await this.assetService.getAssetsByPortfolioId(
          portfolioId,
          userId,
          userToken
        )

        res.status(200).json({
          success: true,
          data: assets,
        })
      } catch (serviceError: unknown) {
        if (
          serviceError instanceof Error &&
          serviceError.message.includes('Portfolio not found')
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
      const userToken = this.extractUserToken(req)
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
        const asset = await this.assetService.getAssetById(
          assetId,
          userId,
          userToken
        )

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
      const userToken = this.extractUserToken(req)
      const assetData: CreateAssetRequest = req.body

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      try {
        const asset = await this.assetService.createAsset(
          userId,
          assetData,
          userToken
        )

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
            serviceError.message.includes('Invalid') ||
            serviceError.message.includes('not found'))
        ) {
          return res.status(400).json({
            success: false,
            error: serviceError.message,
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
      const userToken = this.extractUserToken(req)
      const assetId = req.params.id
      const updateData: UpdateAssetRequest = req.body

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
        const asset = await this.assetService.updateAsset(
          assetId,
          userId,
          updateData,
          userToken
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
          (serviceError.message.includes('must be greater') ||
            serviceError.message.includes('Invalid'))
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
      const userToken = this.extractUserToken(req)
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
        await this.assetService.deleteAsset(assetId, userId, userToken)

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
