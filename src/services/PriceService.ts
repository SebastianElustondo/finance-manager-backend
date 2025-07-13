import { IPriceRepository, PriceData, HistoricalPriceData } from '../repositories/interfaces/IPriceRepository'
import { IPriceService } from './interfaces/IPriceService'
import { IAlertService } from './interfaces/IAlertService'

export class PriceService implements IPriceService {
  constructor(
    private priceRepository: IPriceRepository,
    private alertService?: IAlertService
  ) {}

  async getCurrentPrice(symbol: string): Promise<PriceData> {
    if (!symbol) {
      throw new Error('Symbol is required')
    }

    const normalizedSymbol = symbol.toUpperCase().trim()
    const priceData = await this.priceRepository.getCurrentPrice(normalizedSymbol)

    // Check and trigger alerts if alert service is available
    if (this.alertService) {
      try {
        await this.alertService.checkAndTriggerAlerts(normalizedSymbol, priceData.price)
      } catch (error) {
        console.error('Error checking alerts:', error)
        // Don't throw error here as it's not critical for price fetching
      }
    }

    return priceData
  }

  async getHistoricalPrices(symbol: string, period = '1y', interval = '1d'): Promise<HistoricalPriceData[]> {
    if (!symbol) {
      throw new Error('Symbol is required')
    }

    const normalizedSymbol = symbol.toUpperCase().trim()
    
    // Validate period
    const validPeriods = ['1d', '1w', '1m', '3m', '6m', '1y', '2y', '5y']
    if (!validPeriods.includes(period)) {
      throw new Error(`Invalid period. Valid periods: ${validPeriods.join(', ')}`)
    }

    // Validate interval
    const validIntervals = ['1m', '5m', '15m', '30m', '1h', '1d', '1w', '1M']
    if (!validIntervals.includes(interval)) {
      throw new Error(`Invalid interval. Valid intervals: ${validIntervals.join(', ')}`)
    }

    return await this.priceRepository.getHistoricalPrices(normalizedSymbol, period, interval)
  }

  async getBatchPrices(symbols: string[]): Promise<PriceData[]> {
    if (!symbols || symbols.length === 0) {
      throw new Error('At least one symbol is required')
    }

    if (symbols.length > 50) {
      throw new Error('Maximum 50 symbols allowed per batch request')
    }

    const normalizedSymbols = symbols.map(symbol => symbol.toUpperCase().trim())
    
    // Remove duplicates
    const uniqueSymbols = [...new Set(normalizedSymbols)]
    
    const prices = await this.priceRepository.getBatchPrices(uniqueSymbols)

    // Check and trigger alerts for each symbol if alert service is available
    if (this.alertService) {
      for (const priceData of prices) {
        try {
          await this.alertService.checkAndTriggerAlerts(priceData.symbol, priceData.price)
        } catch (error) {
          console.error(`Error checking alerts for ${priceData.symbol}:`, error)
          // Don't throw error here as it's not critical for price fetching
        }
      }
    }

    return prices
  }
} 