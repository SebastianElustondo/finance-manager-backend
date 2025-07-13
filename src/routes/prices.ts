import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Get current price for a symbol
router.get('/current/:symbol', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol is required',
      });
    }

    // TODO: Implement real-time price fetching from external APIs
    // For now, return mock data
    const mockPrice = {
      symbol: symbol.toUpperCase(),
      price: 100.50,
      change: 2.30,
      changePercent: 2.34,
      volume: 1000000,
      timestamp: new Date(),
      source: 'mock',
    };

    return res.status(200).json({
      success: true,
      data: mockPrice,
    });
  } catch (error) {
    console.error('Get current price error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get historical prices for a symbol
router.get('/history/:symbol', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { symbol } = req.params;
    const { period = '1y', interval = '1d' } = req.query;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol is required',
      });
    }

    // TODO: Implement historical price fetching from external APIs
    // For now, return mock data
    const mockHistoricalData = Array.from({ length: 10 }, (_, i) => ({
      symbol: symbol.toUpperCase(),
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      open: 100 + Math.random() * 10,
      high: 105 + Math.random() * 10,
      low: 95 + Math.random() * 10,
      close: 100 + Math.random() * 10,
      volume: 1000000 + Math.random() * 500000,
    }));

    res.status(200).json({
      success: true,
      data: mockHistoricalData.reverse(),
    });
  } catch (error) {
    console.error('Get historical prices error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get prices for multiple symbols
router.post('/batch', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { symbols } = req.body;

    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({
        success: false,
        error: 'Symbols array is required',
      });
    }

    // TODO: Implement batch price fetching from external APIs
    // For now, return mock data
    const mockPrices = symbols.map(symbol => ({
      symbol: symbol.toUpperCase(),
      price: 100 + Math.random() * 100,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 10,
      volume: 1000000 + Math.random() * 500000,
      timestamp: new Date(),
      source: 'mock',
    }));

    res.status(200).json({
      success: true,
      data: mockPrices,
    });
  } catch (error) {
    console.error('Get batch prices error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router; 