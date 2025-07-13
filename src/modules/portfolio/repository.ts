import { supabase } from '../../shared/config/config'
import {
  IPortfolioRepository,
  Portfolio,
  CreatePortfolioData,
  UpdatePortfolioData,
} from './interfaces'

export class PortfolioRepository implements IPortfolioRepository {
  async findAllByUserId(userId: string): Promise<Portfolio[]> {
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

  async findById(id: string, userId: string): Promise<Portfolio | null> {
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

  async create(data: CreatePortfolioData): Promise<Portfolio> {
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
    data: UpdatePortfolioData
  ): Promise<Portfolio> {
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

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete portfolio: ${error.message}`)
    }
  }

  async setAllDefaultToFalse(userId: string): Promise<void> {
    const { error } = await supabase
      .from('portfolios')
      .update({ is_default: false })
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to update portfolio defaults: ${error.message}`)
    }
  }

  async exists(id: string, userId: string): Promise<boolean> {
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
