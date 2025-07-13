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
  findAllByUserId(userId: string): Promise<Alert[]>
  findById(id: string, userId: string): Promise<Alert | null>
  create(data: CreateAlertData): Promise<Alert>
  update(id: string, userId: string, data: UpdateAlertData): Promise<Alert>
  delete(id: string, userId: string): Promise<void>
  findActiveBySymbol(symbol: string): Promise<Alert[]>
  markAsTriggered(id: string): Promise<void>
} 