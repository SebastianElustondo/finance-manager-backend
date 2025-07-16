import { createClient } from '@supabase/supabase-js'
import { config } from '../../shared/config/config'
import {
  IAlertRepository,
  Alert,
  CreateAlertData,
  UpdateAlertData,
} from './interfaces'

export class AlertRepository implements IAlertRepository {
  private getSupabaseClient(userToken?: string) {
    if (userToken) {
      // Create client with custom headers to include the user token
      return createClient(config.supabase.url, config.supabase.anonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      })
    }

    // Fallback to regular anon client
    return createClient(config.supabase.url, config.supabase.anonKey)
  }

  async findAllByUserId(userId: string, userToken?: string): Promise<Alert[]> {
    const supabase = this.getSupabaseClient(userToken)

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

  async findById(
    id: string,
    userId: string,
    userToken?: string
  ): Promise<Alert | null> {
    const supabase = this.getSupabaseClient(userToken)

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

  async create(data: CreateAlertData, userToken?: string): Promise<Alert> {
    const supabase = this.getSupabaseClient(userToken)

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

  async update(
    id: string,
    userId: string,
    data: UpdateAlertData,
    userToken?: string
  ): Promise<Alert> {
    const supabase = this.getSupabaseClient(userToken)

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

  async delete(id: string, userId: string, userToken?: string): Promise<void> {
    const supabase = this.getSupabaseClient(userToken)

    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete alert: ${error.message}`)
    }
  }

  async findActiveBySymbol(
    symbol: string,
    userToken?: string
  ): Promise<Alert[]> {
    const supabase = this.getSupabaseClient(userToken)

    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('symbol', symbol)
      .eq('is_active', true)
      .eq('is_triggered', false)

    if (error) {
      throw new Error(`Failed to fetch active alerts: ${error.message}`)
    }

    return data || []
  }

  async markAsTriggered(id: string, userToken?: string): Promise<void> {
    const supabase = this.getSupabaseClient(userToken)

    const { error } = await supabase
      .from('alerts')
      .update({
        is_triggered: true,
        triggered_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to mark alert as triggered: ${error.message}`)
    }
  }
}
