import { WebSocketServer, WebSocket } from 'ws';
import { PriceUpdateMessage, AlertMessage, WebSocketMessage } from '../types';
import { PolygonWebSocketClient } from './polygon-websocket';
import { PriceData } from '../repositories/interfaces/IPriceRepository';

interface ConnectedClient {
  ws: WebSocket;
  userId?: string;
  subscribedSymbols: Set<string>;
}

const connectedClients = new Map<string, ConnectedClient>();

// Polygon.io WebSocket client instance
let polygonWsClient: PolygonWebSocketClient | null = null;

export const initializeWebSocket = (wss: WebSocketServer) => {
  wss.on('connection', (ws: WebSocket) => {
    const clientId = generateClientId();
    
    connectedClients.set(clientId, {
      ws,
      subscribedSymbols: new Set(),
    });

    console.log(`🔌 WebSocket client connected: ${clientId}`);

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        handleMessage(clientId, message);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
        }));
      }
    });

    ws.on('close', () => {
      console.log(`🔌 WebSocket client disconnected: ${clientId}`);
      
      // Clean up Polygon.io subscriptions for symbols no longer needed
      const disconnectedClient = connectedClients.get(clientId);
      if (disconnectedClient) {
        disconnectedClient.subscribedSymbols.forEach(symbol => {
          // Check if any other client is still subscribed to this symbol
          let stillSubscribed = false;
          connectedClients.forEach((otherClient, otherClientId) => {
            if (otherClientId !== clientId && otherClient.subscribedSymbols.has(symbol)) {
              stillSubscribed = true;
            }
          });
          
          // Only unsubscribe from Polygon.io if no other client needs this symbol
          if (!stillSubscribed && polygonWsClient && polygonWsClient.isConnected()) {
            polygonWsClient.unsubscribe(symbol);
          }
        });
      }
      
      connectedClients.delete(clientId);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'welcome',
      message: 'Connected to Finance Manager WebSocket',
      clientId,
    }));
  });

  // Initialize Polygon.io WebSocket client for real-time data
  initializePolygonWebSocket();
  
  // Start price update simulation as fallback (mock data)
  startPriceUpdateSimulation();

  console.log('🚀 WebSocket server initialized');
};

// Initialize Polygon.io WebSocket client for real-time price updates
const initializePolygonWebSocket = () => {
  try {
    polygonWsClient = new PolygonWebSocketClient(
      // onPriceUpdate callback
      (priceData: PriceData) => {
        const priceUpdateMessage: PriceUpdateMessage = {
          type: 'price_update',
          data: priceData,
          timestamp: new Date(),
        };
        
        // Broadcast to all clients subscribed to this symbol
        broadcastToSubscribers(priceData.symbol, priceUpdateMessage);
      },
      // onError callback
      (error: Error) => {
        console.error('Polygon.io WebSocket error:', error);
        
        // Optionally broadcast error to clients
        const errorMessage: WebSocketMessage = {
          type: 'error',
          data: { message: `Real-time data error: ${error.message}` },
          timestamp: new Date(),
        };
        broadcastToAll(errorMessage);
      },
      // onConnect callback
      () => {
        console.log('✅ Polygon.io WebSocket connected and authenticated');
        
        // Resubscribe to all symbols that clients are interested in
        const allSymbols = new Set<string>();
        connectedClients.forEach(client => {
          client.subscribedSymbols.forEach(symbol => allSymbols.add(symbol));
        });
        
        allSymbols.forEach(symbol => {
          if (polygonWsClient) {
            polygonWsClient.subscribe(symbol);
          }
        });
      },
      // onDisconnect callback
      () => {
        console.log('❌ Polygon.io WebSocket disconnected');
      }
    );
    
    polygonWsClient.connect();
  } catch (error) {
    console.error('Failed to initialize Polygon.io WebSocket:', error);
  }
};

const handleMessage = (clientId: string, message: any) => {
  const client = connectedClients.get(clientId);
  if (!client) return;

  switch (message.type) {
    case 'auth':
      handleAuth(clientId, message.token);
      break;
    
    case 'subscribe':
      handleSubscribe(clientId, message.symbols);
      break;
    
    case 'unsubscribe':
      handleUnsubscribe(clientId, message.symbols);
      break;
    
    case 'ping':
      client.ws.send(JSON.stringify({ type: 'pong' }));
      break;
    
    default:
      client.ws.send(JSON.stringify({
        type: 'error',
        message: 'Unknown message type',
      }));
  }
};

const handleAuth = async (clientId: string, token: string) => {
  const client = connectedClients.get(clientId);
  if (!client) return;

  try {
    // TODO: Verify token with Supabase
    // For now, just simulate authentication
    client.userId = 'mock-user-id';
    
    client.ws.send(JSON.stringify({
      type: 'auth_success',
      message: 'Authentication successful',
    }));
  } catch (error) {
    client.ws.send(JSON.stringify({
      type: 'auth_error',
      message: 'Authentication failed',
    }));
  }
};

const handleSubscribe = (clientId: string, symbols: string[]) => {
  const client = connectedClients.get(clientId);
  if (!client) return;

  symbols.forEach(symbol => {
    const upperSymbol = symbol.toUpperCase();
    client.subscribedSymbols.add(upperSymbol);
    
    // Also subscribe to Polygon.io WebSocket for real-time updates
    if (polygonWsClient && polygonWsClient.isConnected()) {
      polygonWsClient.subscribe(upperSymbol);
    }
  });

  client.ws.send(JSON.stringify({
    type: 'subscribed',
    symbols: Array.from(client.subscribedSymbols),
  }));

  console.log(`Client ${clientId} subscribed to: ${symbols.join(', ')}`);
};

const handleUnsubscribe = (clientId: string, symbols: string[]) => {
  const client = connectedClients.get(clientId);
  if (!client) return;

  symbols.forEach(symbol => {
    const upperSymbol = symbol.toUpperCase();
    client.subscribedSymbols.delete(upperSymbol);
    
    // Check if any other client is still subscribed to this symbol
    let stillSubscribed = false;
    connectedClients.forEach(otherClient => {
      if (otherClient !== client && otherClient.subscribedSymbols.has(upperSymbol)) {
        stillSubscribed = true;
      }
    });
    
    // Only unsubscribe from Polygon.io if no other client needs this symbol
    if (!stillSubscribed && polygonWsClient && polygonWsClient.isConnected()) {
      polygonWsClient.unsubscribe(upperSymbol);
    }
  });

  client.ws.send(JSON.stringify({
    type: 'unsubscribed',
    symbols: symbols,
  }));

  console.log(`Client ${clientId} unsubscribed from: ${symbols.join(', ')}`);
};

const startPriceUpdateSimulation = () => {
  // Simulate price updates every 5 seconds
  setInterval(() => {
    const mockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'BTC', 'ETH'];
    
    mockSymbols.forEach(symbol => {
      const priceUpdate: PriceUpdateMessage = {
        type: 'price_update',
        data: {
          symbol,
          price: 100 + Math.random() * 100,
          change: (Math.random() - 0.5) * 10,
          changePercent: (Math.random() - 0.5) * 10,
          volume: 1000000 + Math.random() * 500000,
          timestamp: new Date(),
          source: 'mock',
        },
        timestamp: new Date(),
      };

      broadcastToSubscribers(symbol, priceUpdate);
    });
  }, 5000);
};

const broadcastToSubscribers = (symbol: string, message: WebSocketMessage) => {
  connectedClients.forEach((client, clientId) => {
    if (client.subscribedSymbols.has(symbol) && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
};

const broadcastToUser = (userId: string, message: WebSocketMessage) => {
  connectedClients.forEach((client, clientId) => {
    if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
};

const broadcastToAll = (message: WebSocketMessage) => {
  connectedClients.forEach((client, clientId) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
};

const generateClientId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export {
  broadcastToSubscribers,
  broadcastToUser,
  broadcastToAll,
}; 