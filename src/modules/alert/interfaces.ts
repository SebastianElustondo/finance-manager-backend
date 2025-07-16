// Repository interfaces
export interface CreateAlertData {
  user_id: string
  symbol: string
  type: string
  condition: number
  is_active: boolean
  is_triggered: boolean
  message: string
}

export interface UpdateAlertData {
  symbol?: string
  type?: string
  condition?: number
  is_active?: boolean
  is_triggered?: boolean
  message?: string
  triggered_at?: string | null
}

export interface Alert {
  id: string
  user_id: string
  symbol: string
  type: string
  condition: number
  is_active: boolean
  is_triggered: boolean
  message: string
  created_at: string
  updated_at: string
  triggered_at?: string | null
}

export interface IAlertRepository {
  findAllByUserId(userId: string, userToken?: string): Promise<Alert[]>
  findById(
    id: string,
    userId: string,
    userToken?: string
  ): Promise<Alert | null>
  create(data: CreateAlertData, userToken?: string): Promise<Alert>
  update(
    id: string,
    userId: string,
    data: UpdateAlertData,
    userToken?: string
  ): Promise<Alert>
  delete(id: string, userId: string, userToken?: string): Promise<void>
  findActiveBySymbol(symbol: string, userToken?: string): Promise<Alert[]>
  markAsTriggered(id: string, userToken?: string): Promise<void>
}

// Service interfaces
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
  getAllAlerts(userId: string, userToken?: string): Promise<Alert[]>
  getAlertById(id: string, userId: string, userToken?: string): Promise<Alert>
  createAlert(
    userId: string,
    data: CreateAlertRequest,
    userToken?: string
  ): Promise<Alert>
  updateAlert(
    id: string,
    userId: string,
    data: UpdateAlertRequest,
    userToken?: string
  ): Promise<Alert>
  deleteAlert(id: string, userId: string, userToken?: string): Promise<void>
  checkAndTriggerAlerts(
    symbol: string,
    currentPrice: number,
    userToken?: string
  ): Promise<void>
}
