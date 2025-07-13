import { Response } from 'express'
import { AuthenticatedRequest } from '../types'
import { IPriceService } from '../services/interfaces/IPriceService'

export class PriceController {
  constructor(private priceService: IPriceService) {}

  getCurrentPrice = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { symbol } = req.params

      if (!symbol) {
        return res.status(400).json({
          success: false,
          error: 'Symbol is required',
        })
      }

      try {
        const priceData = await this.priceService.getCurrentPrice(symbol)

        res.status(200).json({
          success: true,
          data: priceData,
        })
      } catch (serviceError: any) {
        if (serviceError.message.includes('Symbol is required')) {
          return res.status(400).json({
            success: false,
            error: serviceError.message,
          })
        }
        throw serviceError
      }
    } catch (error) {
      console.error('Get current price error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  getHistoricalPrices = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { symbol } = req.params
      const { period = '1y', interval = '1d' } = req.query

      if (!symbol) {
        return res.status(400).json({
          success: false,
          error: 'Symbol is required',
        })
      }

      try {
        const historicalData = await this.priceService.getHistoricalPrices(
          symbol,
          period as string,
          interval as string
        )

        res.status(200).json({
          success: true,
          data: historicalData,
        })
      } catch (serviceError: any) {
        if (serviceError.message.includes('Symbol is required') ||
            serviceError.message.includes('Invalid period') ||
            serviceError.message.includes('Invalid interval')) {
          return res.status(400).json({
            success: false,
            error: serviceError.message,
          })
        }
        throw serviceError
      }
    } catch (error) {
      console.error('Get historical prices error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  getBatchPrices = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { symbols } = req.body

      if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Symbols array is required',
        })
      }

      try {
        const prices = await this.priceService.getBatchPrices(symbols)

        res.status(200).json({
          success: true,
          data: prices,
        })
      } catch (serviceError: any) {
        if (serviceError.message.includes('At least one symbol') ||
            serviceError.message.includes('Maximum 50 symbols')) {
          return res.status(400).json({
            success: false,
            error: serviceError.message,
          })
        }
        throw serviceError
      }
    } catch (error) {
      console.error('Get batch prices error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }
} 