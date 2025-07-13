import { Router } from 'express'
import { container } from '../container'

const router = Router()
const portfolioController = container.getPortfolioController()

// Portfolio routes
router.get('/', portfolioController.getAllPortfolios)
router.get('/:id', portfolioController.getPortfolioById)
router.post('/', portfolioController.createPortfolio)
router.put('/:id', portfolioController.updatePortfolio)
router.delete('/:id', portfolioController.deletePortfolio)

export default router 