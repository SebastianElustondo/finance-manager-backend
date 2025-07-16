import { Response } from 'express'
import { AuthenticatedRequest } from '../../shared/types'
import { IAlertService, UpdateAlertRequest } from './interfaces'

export class AlertController {
  constructor(private alertService: IAlertService) {}

  private extractUserToken(req: AuthenticatedRequest): string | undefined {
    const authHeader = req.headers.authorization
    if (!authHeader) return undefined

    const token = authHeader.split(' ')[1]
    return token || undefined
  }

  getAllAlerts = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const userToken = this.extractUserToken(req)

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
        return
      }

      const alerts = await this.alertService.getAllAlerts(userId, userToken)

      res.status(200).json({
        success: true,
        data: alerts,
      })
      return
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
      const userToken = this.extractUserToken(req)
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
        const alert = await this.alertService.getAlertById(
          alertId,
          userId,
          userToken
        )

        res.status(200).json({
          success: true,
          data: alert,
        })
      } catch (serviceError: unknown) {
        if (
          serviceError instanceof Error &&
          serviceError.message === 'Alert not found'
        ) {
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
      const userToken = this.extractUserToken(req)
      const { symbol, type, condition, isActive, message } = req.body

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      try {
        const alert = await this.alertService.createAlert(
          userId,
          {
            symbol,
            type,
            condition,
            isActive,
            message,
          },
          userToken
        )

        res.status(201).json({
          success: true,
          message: 'Alert created successfully',
          data: alert,
        })
      } catch (serviceError: unknown) {
        if (
          serviceError instanceof Error &&
          (serviceError.message.includes('required') ||
            serviceError.message.includes('Invalid') ||
            serviceError.message.includes('must be'))
        ) {
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
      const userToken = this.extractUserToken(req)
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
        const updateData: UpdateAlertRequest = {
          symbol,
          type,
          condition,
          isActive,
          message,
        }

        const alert = await this.alertService.updateAlert(
          alertId,
          userId,
          updateData,
          userToken
        )

        res.status(200).json({
          success: true,
          message: 'Alert updated successfully',
          data: alert,
        })
      } catch (serviceError: unknown) {
        if (
          serviceError instanceof Error &&
          serviceError.message === 'Alert not found'
        ) {
          return res.status(404).json({
            success: false,
            error: 'Alert not found',
          })
        }
        if (
          serviceError instanceof Error &&
          (serviceError.message.includes('required') ||
            serviceError.message.includes('Invalid') ||
            serviceError.message.includes('must be'))
        ) {
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
      const userToken = this.extractUserToken(req)
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
        await this.alertService.deleteAlert(alertId, userId, userToken)

        res.status(200).json({
          success: true,
          message: 'Alert deleted successfully',
        })
      } catch (serviceError: unknown) {
        if (
          serviceError instanceof Error &&
          serviceError.message === 'Alert not found'
        ) {
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
