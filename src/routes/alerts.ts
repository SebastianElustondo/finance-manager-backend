import { Router, Response } from 'express';
import { supabase } from '../config/config';
import { AuthenticatedRequest, AlertType } from '../types';

const router = Router();

// Get all alerts for authenticated user
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
      .from('alerts')
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
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Create new alert
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { symbol, type, condition, message } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    if (!symbol || !type || condition === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Symbol, type, and condition are required',
      });
    }

    const { data, error } = await supabase
      .from('alerts')
      .insert([
        {
          user_id: userId,
          symbol: symbol.toUpperCase(),
          type,
          condition: parseFloat(condition),
          message: message || `Alert for ${symbol.toUpperCase()}`,
          is_active: true,
          is_triggered: false,
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
      message: 'Alert created successfully',
      data: data,
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Update alert
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const alertId = req.params.id;
    const { symbol, type, condition, message, isActive } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    // Check if alert exists and belongs to user
    const { data: existingAlert, error: checkError } = await supabase
      .from('alerts')
      .select('id')
      .eq('id', alertId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingAlert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found',
      });
    }

    const updateData: any = {};
    if (symbol !== undefined) updateData.symbol = symbol.toUpperCase();
    if (type !== undefined) updateData.type = type;
    if (condition !== undefined) updateData.condition = parseFloat(condition);
    if (message !== undefined) updateData.message = message;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data, error } = await supabase
      .from('alerts')
      .update(updateData)
      .eq('id', alertId)
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
      message: 'Alert updated successfully',
      data: data,
    });
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Delete alert
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const alertId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    // Check if alert exists and belongs to user
    const { data: existingAlert, error: checkError } = await supabase
      .from('alerts')
      .select('id')
      .eq('id', alertId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingAlert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found',
      });
    }

    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', alertId)
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router; 