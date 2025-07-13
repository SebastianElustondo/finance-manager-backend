import { PriceData, HistoricalPriceData } from '../repositories/interfaces/IPriceRepository';
import { 
  PolygonPreviousClose, 
  PolygonAggregates, 
  PolygonSnapshot 
} from './polygon-client';

export class PriceMapper {
  // Map Polygon.io previous close data to our PriceData format
  static mapPreviousClose(polygonData: PolygonPreviousClose): PriceData {
    const result = polygonData.results[0];
    
    if (!result) {
      throw new Error('No price data available from Polygon.io');
    }

    return {
      symbol: result.T,
      price: result.c,
      change: result.c - result.o, // Close - Open
      changePercent: ((result.c - result.o) / result.o) * 100,
      volume: result.v,
      timestamp: new Date(result.t),
      source: 'polygon.io',
    };
  }

  // Map Polygon.io snapshot data to our PriceData format
  static mapSnapshot(polygonData: PolygonSnapshot): PriceData[] {
    return polygonData.results.map(result => ({
      symbol: result.ticker,
      price: result.day.c,
      change: result.todaysChange,
      changePercent: result.todaysChangePerc,
      volume: result.day.v,
      timestamp: new Date(result.updated),
      source: 'polygon.io',
    }));
  }

  // Map Polygon.io aggregates data to our HistoricalPriceData format
  static mapAggregates(polygonData: PolygonAggregates): HistoricalPriceData[] {
    return polygonData.results.map(result => ({
      symbol: polygonData.ticker,
      date: new Date(result.t),
      open: result.o,
      high: result.h,
      low: result.l,
      close: result.c,
      volume: result.v,
    }));
  }

  // Map single aggregate result to PriceData (for current price from historical data)
  static mapAggregateToCurrentPrice(polygonData: PolygonAggregates): PriceData {
    const latest = polygonData.results[polygonData.results.length - 1];
    
    if (!latest) {
      throw new Error('No price data available from Polygon.io');
    }

    return {
      symbol: polygonData.ticker,
      price: latest.c,
      change: latest.c - latest.o, // Close - Open
      changePercent: ((latest.c - latest.o) / latest.o) * 100,
      volume: latest.v,
      timestamp: new Date(latest.t),
      source: 'polygon.io',
    };
  }

  // Create mock data if Polygon.io is not available (fallback)
  static createMockData(symbol: string): PriceData {
    return {
      symbol: symbol.toUpperCase(),
      price: 100.50 + Math.random() * 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      volume: 1000000 + Math.random() * 500000,
      timestamp: new Date(),
      source: 'mock-fallback',
    };
  }

  // Create mock historical data if Polygon.io is not available (fallback)
  static createMockHistoricalData(symbol: string, days: number): HistoricalPriceData[] {
    return Array.from({ length: days }, (_, i) => {
      const basePrice = 100 + Math.random() * 50;
      return {
        symbol: symbol.toUpperCase(),
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        open: basePrice + Math.random() * 5,
        high: basePrice + Math.random() * 10,
        low: basePrice - Math.random() * 5,
        close: basePrice + Math.random() * 5,
        volume: 1000000 + Math.random() * 500000,
      };
    }).reverse();
  }
} 