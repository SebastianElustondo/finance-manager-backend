import { Router } from 'express'
import { PortfolioController } from './controller'
import { PortfolioService } from './service'
import { PortfolioRepository } from './repository'

const router = Router()

// Create instances
const portfolioRepository = new PortfolioRepository()
const portfolioService = new PortfolioService(portfolioRepository)
const portfolioController = new PortfolioController(portfolioService)

// Portfolio routes
router.get('/', portfolioController.getAllPortfolios)
router.get('/:id', portfolioController.getPortfolioById)
router.post('/', portfolioController.createPortfolio)
router.put('/:id', portfolioController.updatePortfolio)
router.delete('/:id', portfolioController.deletePortfolio)

export default router 