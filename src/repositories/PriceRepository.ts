import { 
  IPriceRepository, 
  PriceData, 
  HistoricalPriceData 
} from './interfaces/IPriceRepository'
import { polygonClient, PolygonClient } from '../services/polygon-client'
import { PriceMapper } from '../services/price-mapper'
import { RetryableOperation, PolygonErrorHandler } from '../services/error-handler'

export class PriceRepository implements IPriceRepository {
  async getCurrentPrice(symbol: string): Promise<PriceData> {
    console.log(`[PriceRepository] Fetching current price for ${symbol}`)
    
    // Use Polygon.io for all instruments
    const operation = new RetryableOperation(async () => {
      // Try to get current price from Polygon.io snapshot
      const snapshotData = await polygonClient.getSnapshot(symbol)
      
      if (snapshotData.results && snapshotData.results.length > 0) {
        const mappedData = PriceMapper.mapSnapshot(snapshotData)
        if (mappedData.length > 0) {
          return mappedData[0]!
        }
      }
      
      // Fallback to previous close if snapshot is not available
      const previousCloseData = await polygonClient.getPreviousClose(symbol)
      return PriceMapper.mapPreviousClose(previousCloseData)
    }, 3); // Max 3 retries
    
    try {
      return await operation.execute();
    } catch (error) {
      const polygonError = PolygonErrorHandler.parseError(error);
      console.error(`Failed to fetch price for ${symbol} after retries:`, polygonError.message);
      
      // Fallback to mock data if all retries fail
      return PriceMapper.createMockData(symbol)
    }
  }

  async getHistoricalPrices(symbol: string, period: string, interval: string): Promise<HistoricalPriceData[]> {
    const operation = new RetryableOperation(async () => {
      // Get date range based on period
      const { from, to } = PolygonClient.getDateRange(period)
      
      // Get aggregates data from Polygon.io
      const aggregatesData = await polygonClient.getAggregates(symbol, 1, 'day', from, to)
      
      // Map to our format
      return PriceMapper.mapAggregates(aggregatesData)
    }, 3); // Max 3 retries
    
    try {
      return await operation.execute();
    } catch (error) {
      const polygonError = PolygonErrorHandler.parseError(error);
      console.error(`Failed to fetch historical prices for ${symbol} after retries:`, polygonError.message);
      
      // Fallback to mock data if all retries fail
      let days = 30 // Default
      if (period === '1d') days = 1
      else if (period === '1w') days = 7
      else if (period === '1m') days = 30
      else if (period === '3m') days = 90
      else if (period === '6m') days = 180
      else if (period === '1y') days = 365

      return PriceMapper.createMockHistoricalData(symbol, days)
    }
  }

  async getBatchPrices(symbols: string[]): Promise<PriceData[]> {
    try {
      // For batch requests, we can use snapshot all and filter
      // Or make individual requests for each symbol
      const prices: PriceData[] = []
      
      // Process symbols in batches to avoid rate limiting
      for (const symbol of symbols) {
        try {
          const price = await this.getCurrentPrice(symbol)
          prices.push(price)
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error)
          // Add fallback data for failed symbols
          prices.push(PriceMapper.createMockData(symbol))
        }
      }

      return prices
    } catch (error) {
      console.error('Error fetching batch prices:', error)
      
      // Fallback to mock data for all symbols
      return symbols.map(symbol => PriceMapper.createMockData(symbol))
    }
  }

  // Helper method for future API integration
  private async fetchFromExternalAPI(url: string): Promise<any> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      throw new Error(`Failed to fetch from external API: ${error}`)
    }
  }

  // Future methods for additional API providers can be added here
  private async fetchFromAlphaVantage(symbol: string): Promise<PriceData> {
    // Implementation for Alpha Vantage API (future enhancement)
    throw new Error('Alpha Vantage integration not implemented yet')
  }

  private async fetchFromCoinGecko(symbol: string): Promise<PriceData> {
    // Implementation for CoinGecko API (future enhancement)
    throw new Error('CoinGecko integration not implemented yet')
  }
} 