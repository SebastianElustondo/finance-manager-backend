import {
  IAlertRepository,
  Alert,
  IAlertService,
  CreateAlertRequest,
  UpdateAlertRequest,
  UpdateAlertData,
} from './interfaces'

export class AlertService implements IAlertService {
  constructor(private alertRepository: IAlertRepository) {}

  async getAllAlerts(userId: string, userToken?: string): Promise<Alert[]> {
    if (!userId) {
      throw new Error('User ID is required')
    }

    return await this.alertRepository.findAllByUserId(userId, userToken)
  }

  async getAlertById(
    id: string,
    userId: string,
    userToken?: string
  ): Promise<Alert> {
    if (!id || !userId) {
      throw new Error('Alert ID and User ID are required')
    }

    const alert = await this.alertRepository.findById(id, userId, userToken)
    if (!alert) {
      throw new Error('Alert not found')
    }

    return alert
  }

  async createAlert(
    userId: string,
    data: CreateAlertRequest,
    userToken?: string
  ): Promise<Alert> {
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!data.symbol?.trim()) {
      throw new Error('Symbol is required')
    }

    if (!data.type) {
      throw new Error('Alert type is required')
    }

    if (!data.message?.trim()) {
      throw new Error('Alert message is required')
    }

    if (data.condition === undefined || data.condition <= 0) {
      throw new Error('Valid condition value is required')
    }

    const validTypes = [
      'price_above',
      'price_below',
      'price_change_up',
      'price_change_down',
    ]
    if (!validTypes.includes(data.type)) {
      throw new Error(
        `Invalid alert type. Must be one of: ${validTypes.join(', ')}`
      )
    }

    const alertData = {
      user_id: userId,
      symbol: data.symbol.trim().toUpperCase(),
      type: data.type,
      condition: data.condition,
      is_active: data.isActive ?? true,
      is_triggered: false,
      message: data.message.trim(),
    }

    return await this.alertRepository.create(alertData, userToken)
  }

  async updateAlert(
    id: string,
    userId: string,
    data: UpdateAlertRequest,
    userToken?: string
  ): Promise<Alert> {
    if (!id || !userId) {
      throw new Error('Alert ID and User ID are required')
    }

    // Check if alert exists and belongs to user
    const existingAlert = await this.alertRepository.findById(
      id,
      userId,
      userToken
    )
    if (!existingAlert) {
      throw new Error('Alert not found')
    }

    const updateData: UpdateAlertData = {}

    if (data.symbol !== undefined) {
      updateData.symbol = data.symbol.trim().toUpperCase()
    }

    if (data.type !== undefined) {
      const validTypes = [
        'price_above',
        'price_below',
        'price_change_up',
        'price_change_down',
      ]
      if (!validTypes.includes(data.type)) {
        throw new Error(
          `Invalid alert type. Must be one of: ${validTypes.join(', ')}`
        )
      }
      updateData.type = data.type
    }

    if (data.condition !== undefined) {
      if (data.condition <= 0) {
        throw new Error('Condition must be greater than 0')
      }
      updateData.condition = data.condition
    }

    if (data.isActive !== undefined) {
      updateData.is_active = data.isActive
    }

    if (data.message !== undefined) {
      updateData.message = data.message.trim()
    }

    return await this.alertRepository.update(id, userId, updateData, userToken)
  }

  async deleteAlert(
    id: string,
    userId: string,
    userToken?: string
  ): Promise<void> {
    if (!id || !userId) {
      throw new Error('Alert ID and User ID are required')
    }

    // Check if alert exists and belongs to user
    const existingAlert = await this.alertRepository.findById(
      id,
      userId,
      userToken
    )
    if (!existingAlert) {
      throw new Error('Alert not found')
    }

    await this.alertRepository.delete(id, userId, userToken)
  }

  async checkAndTriggerAlerts(
    symbol: string,
    currentPrice: number,
    userToken?: string
  ): Promise<void> {
    if (!symbol || currentPrice <= 0) {
      throw new Error('Valid symbol and price are required')
    }

    const activeAlerts = await this.alertRepository.findActiveBySymbol(
      symbol,
      userToken
    )

    for (const alert of activeAlerts) {
      let shouldTrigger = false

      switch (alert.type) {
        case 'price_above':
          shouldTrigger = currentPrice >= alert.condition
          break
        case 'price_below':
          shouldTrigger = currentPrice <= alert.condition
          break
        case 'price_change_up':
          // This would require tracking previous price - simplified for now
          shouldTrigger = false
          break
        case 'price_change_down':
          // This would require tracking previous price - simplified for now
          shouldTrigger = false
          break
        default:
          console.warn(`Unknown alert type: ${alert.type}`)
          continue
      }

      if (shouldTrigger) {
        await this.alertRepository.markAsTriggered(alert.id, userToken)
        // Here you could add notification logic (email, push notification, etc.)
        console.log(`Alert triggered for ${symbol}: ${alert.message}`)
      }
    }
  }
}
