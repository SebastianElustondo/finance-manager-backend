import { supabase } from '../config/config'
import { 
  IAlertRepository, 
  Alert, 
  CreateAlertData, 
  UpdateAlertData 
} from './interfaces/IAlertRepository'

export class AlertRepository implements IAlertRepository {
  async findAllByUserId(userId: string): Promise<Alert[]> {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch alerts: ${error.message}`)
    }

    return data || []
  }

  async findById(id: string, userId: string): Promise<Alert | null> {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Alert not found
      }
      throw new Error(`Failed to fetch alert: ${error.message}`)
    }

    return data
  }

  async create(data: CreateAlertData): Promise<Alert> {
    const { data: alert, error } = await supabase
      .from('alerts')
      .insert([data])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create alert: ${error.message}`)
    }

    return alert
  }

  async update(id: string, userId: string, data: UpdateAlertData): Promise<Alert> {
    const { data: alert, error } = await supabase
      .from('alerts')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update alert: ${error.message}`)
    }

    return alert
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete alert: ${error.message}`)
    }
  }

  async findActiveBySymbol(symbol: string): Promise<Alert[]> {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .eq('is_active', true)
      .eq('is_triggered', false)

    if (error) {
      throw new Error(`Failed to fetch active alerts: ${error.message}`)
    }

    return data || []
  }

  async markAsTriggered(id: string): Promise<void> {
    const { error } = await supabase
      .from('alerts')
      .update({ 
        is_triggered: true, 
        triggered_at: new Date().toISOString() 
      })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to mark alert as triggered: ${error.message}`)
    }
  }
} 