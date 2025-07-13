import { config } from './config';

export enum PolygonPlan {
  BASIC = 'basic',
  STARTER = 'starter', 
  DEVELOPER = 'developer',
  ADVANCED = 'advanced',
  PROFESSIONAL = 'professional'
}

export interface PolygonPlanConfig {
  name: string;
  requestsPerMinute: number;
  requestsPerMonth: number;
  features: {
    realTimeData: boolean;
    historicalData: boolean;
    websocket: boolean;
    newsData: boolean;
    optionsData: boolean;
    forexData: boolean;
    cryptoData: boolean;
    technicalIndicators: boolean;
  };
  endpoints: {
    stocks: boolean;
    options: boolean;
    forex: boolean;
    crypto: boolean;
    indices: boolean;
  };
  dataDelay: number; // minutes
  maxSymbolsPerRequest: number;
  maxHistoricalYears: number;
}

export const POLYGON_PLAN_CONFIGS: Record<PolygonPlan, PolygonPlanConfig> = {
  [PolygonPlan.BASIC]: {
    name: 'Basic',
    requestsPerMinute: 5,
    requestsPerMonth: 1000,
    features: {
      realTimeData: false,
      historicalData: true,
      websocket: false,
      newsData: false,
      optionsData: false,
      forexData: false,
      cryptoData: false,
      technicalIndicators: false,
    },
    endpoints: {
      stocks: true,
      options: false,
      forex: false,
      crypto: false,
      indices: false,
    },
    dataDelay: 15, // 15 minutes delay
    maxSymbolsPerRequest: 10,
    maxHistoricalYears: 2,
  },
  
  [PolygonPlan.STARTER]: {
    name: 'Starter',
    requestsPerMinute: 100,
    requestsPerMonth: 10000,
    features: {
      realTimeData: true,
      historicalData: true,
      websocket: true,
      newsData: true,
      optionsData: false,
      forexData: false,
      cryptoData: true,
      technicalIndicators: false,
    },
    endpoints: {
      stocks: true,
      options: false,
      forex: false,
      crypto: true,
      indices: true,
    },
    dataDelay: 0, // Real-time
    maxSymbolsPerRequest: 50,
    maxHistoricalYears: 2,
  },
  
  [PolygonPlan.DEVELOPER]: {
    name: 'Developer',
    requestsPerMinute: 1000,
    requestsPerMonth: 100000,
    features: {
      realTimeData: true,
      historicalData: true,
      websocket: true,
      newsData: true,
      optionsData: true,
      forexData: true,
      cryptoData: true,
      technicalIndicators: true,
    },
    endpoints: {
      stocks: true,
      options: true,
      forex: true,
      crypto: true,
      indices: true,
    },
    dataDelay: 0, // Real-time
    maxSymbolsPerRequest: 100,
    maxHistoricalYears: 5,
  },
  
  [PolygonPlan.ADVANCED]: {
    name: 'Advanced',
    requestsPerMinute: 2000,
    requestsPerMonth: 250000,
    features: {
      realTimeData: true,
      historicalData: true,
      websocket: true,
      newsData: true,
      optionsData: true,
      forexData: true,
      cryptoData: true,
      technicalIndicators: true,
    },
    endpoints: {
      stocks: true,
      options: true,
      forex: true,
      crypto: true,
      indices: true,
    },
    dataDelay: 0, // Real-time
    maxSymbolsPerRequest: 200,
    maxHistoricalYears: 10,
  },
  
  [PolygonPlan.PROFESSIONAL]: {
    name: 'Professional',
    requestsPerMinute: 10000,
    requestsPerMonth: 1000000,
    features: {
      realTimeData: true,
      historicalData: true,
      websocket: true,
      newsData: true,
      optionsData: true,
      forexData: true,
      cryptoData: true,
      technicalIndicators: true,
    },
    endpoints: {
      stocks: true,
      options: true,
      forex: true,
      crypto: true,
      indices: true,
    },
    dataDelay: 0, // Real-time
    maxSymbolsPerRequest: 500,
    maxHistoricalYears: 20,
  },
};

export class PolygonConfigManager {
  private static currentPlan: PolygonPlan;
  private static currentConfig: PolygonPlanConfig;
  
  static initialize() {
    const planName = config.polygon.plan.toLowerCase() as PolygonPlan;
    
    if (!Object.values(PolygonPlan).includes(planName)) {
      console.warn(`Invalid Polygon.io plan: ${planName}. Defaulting to basic.`);
      this.currentPlan = PolygonPlan.BASIC;
    } else {
      this.currentPlan = planName;
    }
    
    this.currentConfig = POLYGON_PLAN_CONFIGS[this.currentPlan];
    
    console.log(`🎯 Polygon.io plan initialized: ${this.currentConfig.name}`);
    console.log(`📊 Rate limit: ${this.currentConfig.requestsPerMinute} requests/minute`);
    console.log(`⚡ Real-time data: ${this.currentConfig.features.realTimeData ? 'enabled' : 'disabled'}`);
    console.log(`📡 WebSocket: ${this.currentConfig.features.websocket ? 'enabled' : 'disabled'}`);
  }
  
  static getCurrentPlan(): PolygonPlan {
    return this.currentPlan || PolygonPlan.BASIC;
  }
  
  static getCurrentConfig(): PolygonPlanConfig {
    return this.currentConfig || POLYGON_PLAN_CONFIGS[PolygonPlan.BASIC];
  }
  
  static getRateLimit(): { requestsPerMinute: number; windowMs: number } {
    const planConfig = this.getCurrentConfig();
    return {
      requestsPerMinute: planConfig.requestsPerMinute,
      windowMs: 60000, // 1 minute in milliseconds
    };
  }
  
  static isFeatureEnabled(feature: keyof PolygonPlanConfig['features']): boolean {
    return this.getCurrentConfig().features[feature];
  }
  
  static isEndpointEnabled(endpoint: keyof PolygonPlanConfig['endpoints']): boolean {
    return this.getCurrentConfig().endpoints[endpoint];
  }
  
  static getMaxSymbolsPerRequest(): number {
    return this.getCurrentConfig().maxSymbolsPerRequest;
  }
  
  static getMaxHistoricalYears(): number {
    return this.getCurrentConfig().maxHistoricalYears;
  }
  
  static getDataDelay(): number {
    return this.getCurrentConfig().dataDelay;
  }
  
  static validateSymbolCount(symbolCount: number): boolean {
    return symbolCount <= this.getMaxSymbolsPerRequest();
  }
  
  static validateHistoricalPeriod(years: number): boolean {
    return years <= this.getMaxHistoricalYears();
  }
  
  static getOptimalBatchSize(): number {
    // Return a safe batch size based on rate limits
    const config = this.getCurrentConfig();
    return Math.min(config.maxSymbolsPerRequest, Math.floor(config.requestsPerMinute / 4));
  }
  
  static shouldUseWebSocket(): boolean {
    return this.isFeatureEnabled('websocket') && this.isFeatureEnabled('realTimeData');
  }
  
  static getRecommendedRequestInterval(): number {
    // Calculate recommended interval between requests to avoid rate limiting
    const config = this.getCurrentConfig();
    return Math.ceil(60000 / config.requestsPerMinute); // milliseconds between requests
  }
  
  static displayPlanInfo(): void {
    const config = this.getCurrentConfig();
    const plan = this.getCurrentPlan();
    
    console.log(`\n📋 Polygon.io Plan Information:`);
    console.log(`Plan: ${config.name} (${plan})`);
    console.log(`Rate Limit: ${config.requestsPerMinute} requests/minute`);
    console.log(`Monthly Limit: ${config.requestsPerMonth} requests/month`);
    console.log(`Data Delay: ${config.dataDelay === 0 ? 'Real-time' : `${config.dataDelay} minutes`}`);
    console.log(`Max Symbols per Request: ${config.maxSymbolsPerRequest}`);
    console.log(`Max Historical Years: ${config.maxHistoricalYears}`);
    
    console.log(`\n🎯 Enabled Features:`);
    Object.entries(config.features).forEach(([feature, enabled]) => {
      console.log(`  ${feature}: ${enabled ? '✅' : '❌'}`);
    });
    
    console.log(`\n📡 Enabled Endpoints:`);
    Object.entries(config.endpoints).forEach(([endpoint, enabled]) => {
      console.log(`  ${endpoint}: ${enabled ? '✅' : '❌'}`);
    });
    console.log('');
  }
}

// Auto-initialize when module is loaded
PolygonConfigManager.initialize(); 