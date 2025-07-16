import { createClient } from '@supabase/supabase-js'
import { config } from '../../shared/config/config'
import {
  IAssetRepository,
  Asset,
  CreateAssetData,
  UpdateAssetData,
} from './interfaces'

export class AssetRepository implements IAssetRepository {
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

  async findAllByPortfolioId(
    portfolioId: string,
    userToken?: string
  ): Promise<Asset[]> {
    const supabase = this.getSupabaseClient(userToken)

    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch assets: ${error.message}`)
    }

    return data || []
  }

  async findById(
    id: string,
    userId: string,
    userToken?: string
  ): Promise<Asset | null> {
    const supabase = this.getSupabaseClient(userToken)

    const { data, error } = await supabase
      .from('assets')
      .select('*, portfolios!inner(user_id)')
      .eq('id', id)
      .eq('portfolios.user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Asset not found
      }
      throw new Error(`Failed to fetch asset: ${error.message}`)
    }

    return data
  }

  async create(data: CreateAssetData, userToken?: string): Promise<Asset> {
    const supabase = this.getSupabaseClient(userToken)

    const { data: asset, error } = await supabase
      .from('assets')
      .insert([data])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create asset: ${error.message}`)
    }

    return asset
  }

  async update(
    id: string,
    userId: string,
    data: UpdateAssetData,
    userToken?: string
  ): Promise<Asset> {
    const supabase = this.getSupabaseClient(userToken)

    // First verify the asset belongs to the user
    const asset = await this.findById(id, userId, userToken)
    if (!asset) {
      throw new Error('Asset not found or does not belong to user')
    }

    const { data: updatedAsset, error } = await supabase
      .from('assets')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update asset: ${error.message}`)
    }

    return updatedAsset
  }

  async delete(id: string, userId: string, userToken?: string): Promise<void> {
    const supabase = this.getSupabaseClient(userToken)

    // First verify the asset belongs to the user
    const asset = await this.findById(id, userId, userToken)
    if (!asset) {
      throw new Error('Asset not found or does not belong to user')
    }

    const { error } = await supabase.from('assets').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to delete asset: ${error.message}`)
    }
  }

  async existsInUserPortfolio(
    id: string,
    userId: string,
    userToken?: string
  ): Promise<boolean> {
    const supabase = this.getSupabaseClient(userToken)

    const { data, error } = await supabase
      .from('assets')
      .select('id, portfolios!inner(user_id)')
      .eq('id', id)
      .eq('portfolios.user_id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      return false
    }

    if (error) {
      throw new Error(`Failed to check asset existence: ${error.message}`)
    }

    return !!data
  }
}
