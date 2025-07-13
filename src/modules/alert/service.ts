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

  async getAllAlerts(userId: string): Promise<Alert[]> {
    if (!userId) {
      throw new Error('User ID is required')
    }

    return await this.alertRepository.findAllByUserId(userId)
  }

  async getAlertById(id: string, userId: string): Promise<Alert> {
    if (!id || !userId) {
      throw new Error('Alert ID and User ID are required')
    }

    const alert = await this.alertRepository.findById(id, userId)
    if (!alert) {
      throw new Error('Alert not found')
    }

    return alert
  }

  async createAlert(userId: string, data: CreateAlertRequest): Promise<Alert> {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Validate required fields
    if (
      !data.symbol ||
      !data.type ||
      data.condition === undefined ||
      !data.message
    ) {
      throw new Error('Required fields: symbol, type, condition, message')
    }

    if (data.condition <= 0) {
      throw new Error('Condition must be greater than 0')
    }

    const alertData = {
      user_id: userId,
      symbol: data.symbol.toUpperCase(),
      type: data.type,
      condition: data.condition,
      is_active: data.isActive !== undefined ? data.isActive : true,
      is_triggered: false,
      message: data.message.trim(),
    }

    return await this.alertRepository.create(alertData)
  }

  async updateAlert(
    id: string,
    userId: string,
    data: UpdateAlertRequest
  ): Promise<Alert> {
    if (!id || !userId) {
      throw new Error('Alert ID and User ID are required')
    }

    // Check if alert exists and belongs to user
    const existingAlert = await this.alertRepository.findById(id, userId)
    if (!existingAlert) {
      throw new Error('Alert not found')
    }

    // Validate updated fields
    if (data.condition !== undefined && data.condition <= 0) {
      throw new Error('Condition must be greater than 0')
    }

    const updateData: UpdateAlertData = {}
    if (data.symbol !== undefined) updateData.symbol = data.symbol.toUpperCase()
    if (data.type !== undefined) updateData.type = data.type
    if (data.condition !== undefined) updateData.condition = data.condition
    if (data.isActive !== undefined) updateData.is_active = data.isActive
    if (data.message !== undefined) updateData.message = data.message.trim()

    return await this.alertRepository.update(id, userId, updateData)
  }

  async deleteAlert(id: string, userId: string): Promise<void> {
    if (!id || !userId) {
      throw new Error('Alert ID and User ID are required')
    }

    // Check if alert exists and belongs to user
    const existingAlert = await this.alertRepository.findById(id, userId)
    if (!existingAlert) {
      throw new Error('Alert not found')
    }

    await this.alertRepository.delete(id, userId)
  }

  async checkAndTriggerAlerts(
    symbol: string,
    currentPrice: number
  ): Promise<void> {
    if (!symbol || currentPrice <= 0) {
      throw new Error('Valid symbol and price are required')
    }

    const activeAlerts = await this.alertRepository.findActiveBySymbol(symbol)

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
        await this.alertRepository.markAsTriggered(alert.id)
        // Here you could add notification logic (email, push notification, etc.)
        console.log(`Alert triggered for ${symbol}: ${alert.message}`)
      }
    }
  }
}
