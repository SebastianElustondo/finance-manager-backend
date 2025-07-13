import { Router } from 'express'
import { container } from '../container'

const router = Router()
const priceController = container.getPriceController()

// Price routes
router.get('/current/:symbol', priceController.getCurrentPrice)
router.get('/history/:symbol', priceController.getHistoricalPrices)
router.post('/batch', priceController.getBatchPrices)

export default router 