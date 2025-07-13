import { Response } from 'express'
import { AuthenticatedRequest } from '../types'
import { IAlertService } from '../services/interfaces/IAlertService'

export class AlertController {
  constructor(private alertService: IAlertService) {}

  getAllAlerts = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      const alerts = await this.alertService.getAllAlerts(userId)

      res.status(200).json({
        success: true,
        data: alerts,
      })
    } catch (error) {
      console.error('Get alerts error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  getAlertById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const alertId = req.params.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      if (!alertId) {
        return res.status(400).json({
          success: false,
          error: 'Alert ID is required',
        })
      }

      try {
        const alert = await this.alertService.getAlertById(alertId, userId)

        res.status(200).json({
          success: true,
          data: alert,
        })
      } catch (serviceError: any) {
        if (serviceError.message === 'Alert not found') {
          return res.status(404).json({
            success: false,
            error: 'Alert not found',
          })
        }
        throw serviceError
      }
    } catch (error) {
      console.error('Get alert error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  createAlert = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const { symbol, type, condition, isActive, message } = req.body

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      try {
        const alert = await this.alertService.createAlert(userId, {
          symbol,
          type,
          condition: parseFloat(condition),
          isActive,
          message,
        })

        res.status(201).json({
          success: true,
          message: 'Alert created successfully',
          data: alert,
        })
      } catch (serviceError: any) {
        if (serviceError.message.includes('required') || 
            serviceError.message.includes('must be greater')) {
          return res.status(400).json({
            success: false,
            error: serviceError.message,
          })
        }
        throw serviceError
      }
    } catch (error) {
      console.error('Create alert error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  updateAlert = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const alertId = req.params.id
      const { symbol, type, condition, isActive, message } = req.body

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      if (!alertId) {
        return res.status(400).json({
          success: false,
          error: 'Alert ID is required',
        })
      }

      try {
        const updateData: any = {}
        if (symbol !== undefined) updateData.symbol = symbol
        if (type !== undefined) updateData.type = type
        if (condition !== undefined) updateData.condition = parseFloat(condition)
        if (isActive !== undefined) updateData.isActive = isActive
        if (message !== undefined) updateData.message = message

        const alert = await this.alertService.updateAlert(alertId, userId, updateData)

        res.status(200).json({
          success: true,
          message: 'Alert updated successfully',
          data: alert,
        })
      } catch (serviceError: any) {
        if (serviceError.message === 'Alert not found') {
          return res.status(404).json({
            success: false,
            error: 'Alert not found',
          })
        }
        if (serviceError.message.includes('must be greater')) {
          return res.status(400).json({
            success: false,
            error: serviceError.message,
          })
        }
        throw serviceError
      }
    } catch (error) {
      console.error('Update alert error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  deleteAlert = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const alertId = req.params.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      if (!alertId) {
        return res.status(400).json({
          success: false,
          error: 'Alert ID is required',
        })
      }

      try {
        await this.alertService.deleteAlert(alertId, userId)

        res.status(200).json({
          success: true,
          message: 'Alert deleted successfully',
        })
      } catch (serviceError: any) {
        if (serviceError.message === 'Alert not found') {
          return res.status(404).json({
            success: false,
            error: 'Alert not found',
          })
        }
        throw serviceError
      }
    } catch (error) {
      console.error('Delete alert error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }
} 