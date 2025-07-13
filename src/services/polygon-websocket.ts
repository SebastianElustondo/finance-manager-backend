import WebSocket from 'ws';
import { config } from '../config/config';
import { PriceData } from '../repositories/interfaces/IPriceRepository';

// Polygon.io WebSocket message types
export interface PolygonWebSocketMessage {
  ev: string; // Event type
  sym: string; // Symbol
  v?: number; // Volume
  av?: number; // Accumulated volume
  op?: number; // Open price
  vw?: number; // Volume weighted average price
  o?: number; // Open price
  c?: number; // Close price
  h?: number; // High price
  l?: number; // Low price
  a?: number; // Ask price
  b?: number; // Bid price
  t?: number; // Timestamp
  n?: number; // Number of trades
  s?: number; // Timestamp start
  e?: number; // Timestamp end
}

export interface PolygonAuthMessage {
  ev: string;
  status: string;
  message: string;
}

export class PolygonWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds
  private isAuthenticated = false;
  private subscribedSymbols = new Set<string>();
  private onPriceUpdate: (priceData: PriceData) => void;
  private onError: (error: Error) => void;
  private onConnect: () => void;
  private onDisconnect: () => void;

  constructor(
    onPriceUpdate: (priceData: PriceData) => void,
    onError: (error: Error) => void,
    onConnect: () => void,
    onDisconnect: () => void
  ) {
    this.onPriceUpdate = onPriceUpdate;
    this.onError = onError;
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    const apiKey = config.polygon.apiKey;
    if (!apiKey) {
      this.onError(new Error('Polygon.io API key is required for WebSocket connection'));
      return;
    }

    try {
      this.ws = new WebSocket(config.polygon.websocketUrl);

      this.ws.on('open', () => {
        console.log('🟢 Polygon.io WebSocket connected');
        this.reconnectAttempts = 0;
        this.authenticate();
      });

      this.ws.on('message', (data: string) => {
        try {
          const messages = JSON.parse(data);
          if (Array.isArray(messages)) {
            messages.forEach(message => this.handleMessage(message));
          } else {
            this.handleMessage(messages);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.onError(new Error('Failed to parse WebSocket message'));
        }
      });

      this.ws.on('close', (code: number, reason: string) => {
        console.log(`🔴 Polygon.io WebSocket disconnected: ${code} - ${reason}`);
        this.isAuthenticated = false;
        this.onDisconnect();
        this.handleReconnect();
      });

      this.ws.on('error', (error: Error) => {
        console.error('Polygon.io WebSocket error:', error);
        this.onError(error);
      });

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.onError(error as Error);
    }
  }

  private authenticate() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const authMessage = {
      action: 'auth',
      params: config.polygon.apiKey
    };

    this.ws.send(JSON.stringify(authMessage));
  }

  private handleMessage(message: PolygonWebSocketMessage | PolygonAuthMessage) {
    switch (message.ev) {
      case 'status':
        this.handleStatusMessage(message as PolygonAuthMessage);
        break;
      case 'A': // Minute aggregate
      case 'AM': // Minute aggregate
        this.handleAggregateMessage(message as PolygonWebSocketMessage);
        break;
      case 'T': // Trade
        this.handleTradeMessage(message as PolygonWebSocketMessage);
        break;
      case 'Q': // Quote
        this.handleQuoteMessage(message as PolygonWebSocketMessage);
        break;
      default:
        // Handle other message types if needed
        break;
    }
  }

  private handleStatusMessage(message: PolygonAuthMessage) {
    if (message.status === 'auth_success') {
      console.log('✅ Polygon.io WebSocket authenticated successfully');
      this.isAuthenticated = true;
      this.onConnect();
      
      // Re-subscribe to symbols after authentication
      this.resubscribeToSymbols();
    } else if (message.status === 'auth_failed') {
      console.error('❌ Polygon.io WebSocket authentication failed:', message.message);
      this.onError(new Error(`Authentication failed: ${message.message}`));
    }
  }

  private handleAggregateMessage(message: PolygonWebSocketMessage) {
    if (!message.sym || !message.c) return;

    const priceData: PriceData = {
      symbol: message.sym,
      price: message.c,
      change: message.c - (message.o || message.c),
      changePercent: message.o ? ((message.c - message.o) / message.o) * 100 : 0,
      volume: message.v || 0,
      timestamp: new Date(message.t || Date.now()),
      source: 'polygon.io-websocket',
    };

    this.onPriceUpdate(priceData);
  }

  private handleTradeMessage(message: PolygonWebSocketMessage) {
    if (!message.sym || !message.c) return;

    const priceData: PriceData = {
      symbol: message.sym,
      price: message.c,
      change: 0, // We don't have open price in trade messages
      changePercent: 0,
      volume: message.v || 0,
      timestamp: new Date(message.t || Date.now()),
      source: 'polygon.io-websocket',
    };

    this.onPriceUpdate(priceData);
  }

  private handleQuoteMessage(message: PolygonWebSocketMessage) {
    if (!message.sym || (!message.a && !message.b)) return;

    // Use mid price (average of bid and ask)
    const price = message.a && message.b ? (message.a + message.b) / 2 : (message.a || message.b || 0);

    const priceData: PriceData = {
      symbol: message.sym,
      price: price,
      change: 0, // We don't have open price in quote messages
      changePercent: 0,
      volume: 0, // Quotes don't include volume
      timestamp: new Date(message.t || Date.now()),
      source: 'polygon.io-websocket',
    };

    this.onPriceUpdate(priceData);
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.onError(new Error('Failed to reconnect after maximum attempts'));
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectInterval}ms...`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  private resubscribeToSymbols() {
    if (this.subscribedSymbols.size > 0) {
      const symbols = Array.from(this.subscribedSymbols);
      this.subscribedSymbols.clear();
      symbols.forEach(symbol => this.subscribe(symbol));
    }
  }

  subscribe(symbol: string) {
    if (!this.isAuthenticated || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Store symbol for later subscription
      this.subscribedSymbols.add(symbol);
      return;
    }

    const subscribeMessage = {
      action: 'subscribe',
      params: `A.${symbol}` // Subscribe to minute aggregates
    };

    this.ws.send(JSON.stringify(subscribeMessage));
    this.subscribedSymbols.add(symbol);
    console.log(`📈 Subscribed to ${symbol} price updates`);
  }

  unsubscribe(symbol: string) {
    if (!this.isAuthenticated || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.subscribedSymbols.delete(symbol);
      return;
    }

    const unsubscribeMessage = {
      action: 'unsubscribe',
      params: `A.${symbol}`
    };

    this.ws.send(JSON.stringify(unsubscribeMessage));
    this.subscribedSymbols.delete(symbol);
    console.log(`📉 Unsubscribed from ${symbol} price updates`);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isAuthenticated = false;
    this.subscribedSymbols.clear();
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN && this.isAuthenticated;
  }

  getSubscribedSymbols(): string[] {
    return Array.from(this.subscribedSymbols);
  }
} 