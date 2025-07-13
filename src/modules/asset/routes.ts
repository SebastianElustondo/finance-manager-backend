import { Router } from 'express'
import { AssetController } from './controller'
import { AssetService } from './service'
import { AssetRepository } from './repository'
import { PortfolioRepository } from '../portfolio/repository'

const router = Router()

// Create instances
const assetRepository = new AssetRepository()
const portfolioRepository = new PortfolioRepository()
const assetService = new AssetService(assetRepository, portfolioRepository)
const assetController = new AssetController(assetService)

// Asset routes
router.get('/', assetController.getAssetsByPortfolioId)
router.get('/:id', assetController.getAssetById)
router.post('/', assetController.createAsset)
router.put('/:id', assetController.updateAsset)
router.delete('/:id', assetController.deleteAsset)

export default router 