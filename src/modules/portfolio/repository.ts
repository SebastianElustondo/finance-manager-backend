import { createClient } from '@supabase/supabase-js'
import { config } from '../../shared/config/config'
import {
  IPortfolioRepository,
  Portfolio,
  CreatePortfolioData,
  UpdatePortfolioData,
} from './interfaces'

export class PortfolioRepository implements IPortfolioRepository {
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

  async findAllByUserId(
    userId: string,
    userToken?: string
  ): Promise<Portfolio[]> {
    const supabase = this.getSupabaseClient(userToken)

    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch portfolios: ${error.message}`)
    }

    return data || []
  }

  async findById(
    id: string,
    userId: string,
    userToken?: string
  ): Promise<Portfolio | null> {
    const supabase = this.getSupabaseClient(userToken)

    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Portfolio not found
      }
      throw new Error(`Failed to fetch portfolio: ${error.message}`)
    }

    return data
  }

  async create(
    data: CreatePortfolioData,
    userToken?: string
  ): Promise<Portfolio> {
    const supabase = this.getSupabaseClient(userToken)

    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .insert([data])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create portfolio: ${error.message}`)
    }

    return portfolio
  }

  async update(
    id: string,
    userId: string,
    data: UpdatePortfolioData,
    userToken?: string
  ): Promise<Portfolio> {
    const supabase = this.getSupabaseClient(userToken)

    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update portfolio: ${error.message}`)
    }

    return portfolio
  }

  async delete(id: string, userId: string, userToken?: string): Promise<void> {
    const supabase = this.getSupabaseClient(userToken)

    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete portfolio: ${error.message}`)
    }
  }

  async setAllDefaultToFalse(
    userId: string,
    userToken?: string
  ): Promise<void> {
    const supabase = this.getSupabaseClient(userToken)

    const { error } = await supabase
      .from('portfolios')
      .update({ is_default: false })
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to update portfolio defaults: ${error.message}`)
    }
  }

  async exists(
    id: string,
    userId: string,
    userToken?: string
  ): Promise<boolean> {
    const supabase = this.getSupabaseClient(userToken)

    const { data, error } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      return false
    }

    if (error) {
      throw new Error(`Failed to check portfolio existence: ${error.message}`)
    }

    return !!data
  }
}
