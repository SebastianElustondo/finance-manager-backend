import { Alert } from '../../repositories/interfaces/IAlertRepository'

export interface CreateAlertRequest {
  symbol: string
  type: string
  condition: number
  isActive?: boolean
  message: string
}

export interface UpdateAlertRequest {
  symbol?: string
  type?: string
  condition?: number
  isActive?: boolean
  message?: string
}

export interface IAlertService {
  getAllAlerts(userId: string): Promise<Alert[]>
  getAlertById(id: string, userId: string): Promise<Alert>
  createAlert(userId: string, data: CreateAlertRequest): Promise<Alert>
  updateAlert(id: string, userId: string, data: UpdateAlertRequest): Promise<Alert>
  deleteAlert(id: string, userId: string): Promise<void>
  checkAndTriggerAlerts(symbol: string, currentPrice: number): Promise<void>
} 