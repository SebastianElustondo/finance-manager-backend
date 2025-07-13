import { supabase } from '../config/config'
import { 
  IAssetRepository, 
  Asset, 
  CreateAssetData, 
  UpdateAssetData 
} from './interfaces/IAssetRepository'

export class AssetRepository implements IAssetRepository {
  async findAllByPortfolioId(portfolioId: string): Promise<Asset[]> {
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

  async findById(id: string, userId: string): Promise<Asset | null> {
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

  async create(data: CreateAssetData): Promise<Asset> {
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

  async update(id: string, userId: string, data: UpdateAssetData): Promise<Asset> {
    const { data: asset, error } = await supabase
      .from('assets')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update asset: ${error.message}`)
    }

    return asset
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete asset: ${error.message}`)
    }
  }

  async existsInUserPortfolio(id: string, userId: string): Promise<boolean> {
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