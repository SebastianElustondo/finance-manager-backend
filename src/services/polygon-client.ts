import fetch from 'node-fetch';
import { config } from '../config/config';
import { PolygonConfigManager } from '../config/polygon-config';

// Types for Polygon.io API responses
export interface PolygonPreviousClose {
  ticker: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  results: {
    T: string; // Ticker
    c: number; // Close price
    h: number; // High price
    l: number; // Low price
    o: number; // Open price
    v: number; // Volume
    t: number; // Timestamp
  }[];
  status: string;
  request_id: string;
}

export interface PolygonAggregates {
  ticker: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  results: {
    c: number; // Close price
    h: number; // High price
    l: number; // Low price
    o: number; // Open price
    v: number; // Volume
    t: number; // Timestamp
    vw: number; // Volume weighted average price
    n: number; // Number of transactions
  }[];
  status: string;
  request_id: string;
  next_url?: string;
}

export interface PolygonSnapshot {
  status: string;
  request_id: string;
  results: {
    ticker: string;
    todaysChangePerc: number;
    todaysChange: number;
    updated: number;
    day: {
      c: number; // Close
      h: number; // High
      l: number; // Low
      o: number; // Open
      v: number; // Volume
    };
    min: {
      c: number;
      h: number;
      l: number;
      o: number;
      v: number;
    };
    prevDay: {
      c: number;
      h: number;
      l: number;
      o: number;
      v: number;
    };
  }[];
}

export interface PolygonTickerDetails {
  results: {
    ticker: string;
    name: string;
    market: string;
    locale: string;
    primary_exchange: string;
    type: string;
    active: boolean;
    currency_name: string;
    last_updated_utc?: string;
  };
  status: string;
  request_id: string;
}

// Rate limiting
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async throttle(): Promise<void> {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    // If we're at the limit, wait
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      if (oldestRequest) {
        const waitTime = this.windowMs - (now - oldestRequest);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.throttle();
      }
    }
    
    // Add current request
    this.requests.push(now);
  }
}

export class PolygonClient {
  private apiKey: string;
  private baseUrl: string;
  private rateLimiter: RateLimiter;

  constructor() {
    this.apiKey = config.polygon.apiKey;
    this.baseUrl = config.polygon.baseUrl;
    
    // Use plan-specific rate limits
    const rateLimit = PolygonConfigManager.getRateLimit();
    this.rateLimiter = new RateLimiter(
      rateLimit.requestsPerMinute,
      rateLimit.windowMs
    );

    if (!this.apiKey) {
      throw new Error('Polygon.io API key is required');
    }
    
    // Display plan information on initialization
    if (process.env.NODE_ENV !== 'test') {
      PolygonConfigManager.displayPlanInfo();
    }
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    await this.rateLimiter.throttle();

    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('apikey', this.apiKey);

    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Polygon API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as T;
      return data;
    } catch (error) {
      console.error('Polygon API request failed:', error);
      throw error;
    }
  }

  // Get current/previous day's data for a ticker
  async getPreviousClose(ticker: string): Promise<PolygonPreviousClose> {
    return this.makeRequest<PolygonPreviousClose>(`/v2/aggs/ticker/${ticker}/prev`);
  }

  // Get aggregates (bars) for a ticker
  async getAggregates(
    ticker: string,
    multiplier: number = 1,
    timespan: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' = 'day',
    from: string,
    to: string,
    adjusted: boolean = true
  ): Promise<PolygonAggregates> {
    return this.makeRequest<PolygonAggregates>(
      `/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`,
      { adjusted }
    );
  }

  // Get snapshot of current market data
  async getSnapshot(ticker: string): Promise<PolygonSnapshot> {
    return this.makeRequest<PolygonSnapshot>(`/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}`);
  }

  // Get snapshots for multiple tickers
  async getSnapshotAll(): Promise<PolygonSnapshot> {
    return this.makeRequest<PolygonSnapshot>(`/v2/snapshot/locale/us/markets/stocks/tickers`);
  }

  // Get ticker details
  async getTickerDetails(ticker: string): Promise<PolygonTickerDetails> {
    return this.makeRequest<PolygonTickerDetails>(`/v3/reference/tickers/${ticker}`);
  }

  // Get market status
  async getMarketStatus(): Promise<any> {
    return this.makeRequest(`/v1/marketstatus/now`);
  }

  // Get market holidays
  async getMarketHolidays(): Promise<any> {
    return this.makeRequest(`/v1/marketstatus/upcoming`);
  }

  // Get ticker news with simplified parameters
  async getTickerNews(ticker: string, limit: number = 10): Promise<any> {
    return this.makeRequest(`/v2/reference/news`, {
      ticker,
      limit,
      order: 'desc'
    });
  }

  // Helper method to format date for API
  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0]!;
  }

  // Helper method to get date range for historical data
  static getDateRange(period: string): { from: string; to: string } {
    const to = new Date();
    const from = new Date();

    switch (period) {
      case '1d':
        from.setDate(from.getDate() - 1);
        break;
      case '1w':
        from.setDate(from.getDate() - 7);
        break;
      case '1m':
        from.setMonth(from.getMonth() - 1);
        break;
      case '3m':
        from.setMonth(from.getMonth() - 3);
        break;
      case '6m':
        from.setMonth(from.getMonth() - 6);
        break;
      case '1y':
        from.setFullYear(from.getFullYear() - 1);
        break;
      case '2y':
        from.setFullYear(from.getFullYear() - 2);
        break;
      case '5y':
        from.setFullYear(from.getFullYear() - 5);
        break;
      default:
        from.setMonth(from.getMonth() - 1);
    }

    return {
      from: PolygonClient.formatDate(from),
      to: PolygonClient.formatDate(to)
    };
  }
}

// Export singleton instance
export const polygonClient = new PolygonClient(); 