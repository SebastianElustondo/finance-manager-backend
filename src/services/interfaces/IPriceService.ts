import { PriceData, HistoricalPriceData } from '../../repositories/interfaces/IPriceRepository'

export interface IPriceService {
  getCurrentPrice(symbol: string): Promise<PriceData>
  getHistoricalPrices(symbol: string, period?: string, interval?: string): Promise<HistoricalPriceData[]>
  getBatchPrices(symbols: string[]): Promise<PriceData[]>
} 