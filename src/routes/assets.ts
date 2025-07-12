import { Router, Response } from 'express';
import { supabase } from '../config/config';
import { AuthenticatedRequest, AssetType } from '../types';

const router = Router();

// Get all assets for a portfolio
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { portfolioId } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    if (!portfolioId) {
      return res.status(400).json({
        success: false,
        error: 'Portfolio ID is required',
      });
    }

    // Verify portfolio belongs to user
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', portfolioId)
      .eq('user_id', userId)
      .single();

    if (portfolioError || !portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found',
      });
    }

    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Create new asset
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      portfolioId,
      symbol,
      name,
      type,
      quantity,
      purchasePrice,
      currentPrice,
      purchaseDate,
      exchange,
      currency = 'USD',
      notes,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    if (!portfolioId || !symbol || !name || !type || !quantity || !purchasePrice) {
      return res.status(400).json({
        success: false,
        error: 'Required fields: portfolioId, symbol, name, type, quantity, purchasePrice',
      });
    }

    // Verify portfolio belongs to user
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', portfolioId)
      .eq('user_id', userId)
      .single();

    if (portfolioError || !portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found',
      });
    }

    const { data, error } = await supabase
      .from('assets')
      .insert([
        {
          portfolio_id: portfolioId,
          symbol: symbol.toUpperCase(),
          name,
          type,
          quantity: parseFloat(quantity),
          purchase_price: parseFloat(purchasePrice),
          current_price: currentPrice ? parseFloat(currentPrice) : parseFloat(purchasePrice),
          purchase_date: purchaseDate || new Date().toISOString(),
          exchange,
          currency,
          notes,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: data,
    });
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Update asset
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const assetId = req.params.id;
    const {
      symbol,
      name,
      type,
      quantity,
      purchasePrice,
      currentPrice,
      purchaseDate,
      exchange,
      currency,
      notes,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    // Check if asset exists and belongs to user's portfolio
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('*, portfolios!inner(user_id)')
      .eq('id', assetId)
      .eq('portfolios.user_id', userId)
      .single();

    if (assetError || !asset) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found',
      });
    }

    const updateData: any = {};
    if (symbol !== undefined) updateData.symbol = symbol.toUpperCase();
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
    if (purchasePrice !== undefined) updateData.purchase_price = parseFloat(purchasePrice);
    if (currentPrice !== undefined) updateData.current_price = parseFloat(currentPrice);
    if (purchaseDate !== undefined) updateData.purchase_date = purchaseDate;
    if (exchange !== undefined) updateData.exchange = exchange;
    if (currency !== undefined) updateData.currency = currency;
    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await supabase
      .from('assets')
      .update(updateData)
      .eq('id', assetId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      data: data,
    });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Delete asset
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const assetId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    // Check if asset exists and belongs to user's portfolio
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('*, portfolios!inner(user_id)')
      .eq('id', assetId)
      .eq('portfolios.user_id', userId)
      .single();

    if (assetError || !asset) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found',
      });
    }

    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router; 