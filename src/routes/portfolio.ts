import { Router, Response } from 'express';
import { supabase } from '../config/config';
import { AuthenticatedRequest, Portfolio } from '../types';

const router = Router();

// Get all portfolios for authenticated user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
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
    console.error('Get portfolios error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get portfolio by ID
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const portfolioId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Portfolio not found',
        });
      }
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Create new portfolio
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, description, currency = 'USD', isDefault = false } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Portfolio name is required',
      });
    }

    // If this is set as default, update all other portfolios to not be default
    if (isDefault) {
      await supabase
        .from('portfolios')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('portfolios')
      .insert([
        {
          user_id: userId,
          name,
          description,
          currency,
          is_default: isDefault,
          total_value: 0,
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
      message: 'Portfolio created successfully',
      data: data,
    });
  } catch (error) {
    console.error('Create portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Update portfolio
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const portfolioId = req.params.id;
    const { name, description, currency, isDefault } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    // Check if portfolio exists and belongs to user
    const { data: existingPortfolio, error: checkError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', portfolioId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingPortfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found',
      });
    }

    // If this is set as default, update all other portfolios to not be default
    if (isDefault) {
      await supabase
        .from('portfolios')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (currency !== undefined) updateData.currency = currency;
    if (isDefault !== undefined) updateData.is_default = isDefault;

    const { data, error } = await supabase
      .from('portfolios')
      .update(updateData)
      .eq('id', portfolioId)
      .eq('user_id', userId)
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
      message: 'Portfolio updated successfully',
      data: data,
    });
  } catch (error) {
    console.error('Update portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Delete portfolio
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const portfolioId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    // Check if portfolio exists and belongs to user
    const { data: existingPortfolio, error: checkError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', portfolioId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingPortfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found',
      });
    }

    // Delete the portfolio (cascade delete will handle assets and transactions)
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', portfolioId)
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Portfolio deleted successfully',
    });
  } catch (error) {
    console.error('Delete portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router; 