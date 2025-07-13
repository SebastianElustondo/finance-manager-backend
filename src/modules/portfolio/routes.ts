import { Router } from 'express'
import { PortfolioController } from './controller'
import { PortfolioService } from './service'
import { PortfolioRepository } from './repository'

const router = Router()

// Create instances
const portfolioRepository = new PortfolioRepository()
const portfolioService = new PortfolioService(portfolioRepository)
const portfolioController = new PortfolioController(portfolioService)

/**
 * @swagger
 * /api/v1/portfolio:
 *   get:
 *     summary: Get all portfolios
 *     description: Retrieve all portfolios for the authenticated user
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved portfolios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Portfolio'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', portfolioController.getAllPortfolios)

/**
 * @swagger
 * /api/v1/portfolio/{id}:
 *   get:
 *     summary: Get portfolio by ID
 *     description: Retrieve a specific portfolio by its ID
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Portfolio ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Successfully retrieved portfolio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Portfolio'
 *       404:
 *         description: Portfolio not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', portfolioController.getPortfolioById)

/**
 * @swagger
 * /api/v1/portfolio:
 *   post:
 *     summary: Create a new portfolio
 *     description: Create a new portfolio for the authenticated user
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - currency
 *             properties:
 *               name:
 *                 type: string
 *                 description: Portfolio name
 *                 example: "My Investment Portfolio"
 *               description:
 *                 type: string
 *                 description: Portfolio description
 *                 example: "Long-term investment portfolio"
 *               currency:
 *                 type: string
 *                 description: Portfolio currency
 *                 example: "USD"
 *                 enum: [USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY]
 *               isDefault:
 *                 type: boolean
 *                 description: Whether this is the default portfolio
 *                 example: false
 *     responses:
 *       201:
 *         description: Portfolio created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Portfolio'
 *                 message:
 *                   type: string
 *                   example: "Portfolio created successfully"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', portfolioController.createPortfolio)

/**
 * @swagger
 * /api/v1/portfolio/{id}:
 *   put:
 *     summary: Update a portfolio
 *     description: Update an existing portfolio
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Portfolio ID
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Portfolio name
 *                 example: "Updated Portfolio Name"
 *               description:
 *                 type: string
 *                 description: Portfolio description
 *                 example: "Updated description"
 *               currency:
 *                 type: string
 *                 description: Portfolio currency
 *                 example: "EUR"
 *                 enum: [USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY]
 *               isDefault:
 *                 type: boolean
 *                 description: Whether this is the default portfolio
 *                 example: true
 *     responses:
 *       200:
 *         description: Portfolio updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Portfolio'
 *                 message:
 *                   type: string
 *                   example: "Portfolio updated successfully"
 *       404:
 *         description: Portfolio not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', portfolioController.updatePortfolio)

/**
 * @swagger
 * /api/v1/portfolio/{id}:
 *   delete:
 *     summary: Delete a portfolio
 *     description: Delete an existing portfolio and all its assets
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Portfolio ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Portfolio deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Portfolio deleted successfully"
 *       404:
 *         description: Portfolio not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Cannot delete default portfolio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', portfolioController.deletePortfolio)

export default router
