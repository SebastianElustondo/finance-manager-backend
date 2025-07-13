import { Router } from 'express'
import { container } from '../container'

const router = Router()
const assetController = container.getAssetController()

// Asset routes
router.get('/', assetController.getAssetsByPortfolioId)
router.get('/:id', assetController.getAssetById)
router.post('/', assetController.createAsset)
router.put('/:id', assetController.updateAsset)
router.delete('/:id', assetController.deleteAsset)

export default router 