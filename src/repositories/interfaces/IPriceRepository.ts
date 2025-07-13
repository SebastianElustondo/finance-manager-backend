export interface PriceData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: Date
  source: string
}

export interface HistoricalPriceData {
  symbol: string
  date: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface IPriceRepository {
  getCurrentPrice(symbol: string): Promise<PriceData>
  getHistoricalPrices(symbol: string, period: string, interval: string): Promise<HistoricalPriceData[]>
  getBatchPrices(symbols: string[]): Promise<PriceData[]>
} 