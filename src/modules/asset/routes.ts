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

/**
 * @swagger
 * /api/assets:
 *   get:
 *     summary: Get all assets for a specific portfolio
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: portfolioId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Portfolio ID
 *     responses:
 *       200:
 *         description: List of assets in the portfolio
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
 *                     $ref: '#/components/schemas/Asset'
 *                 message:
 *                   type: string
 *                   example: "Assets retrieved successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', assetController.getAssetsByPortfolioId)

/**
 * @swagger
 * /api/assets/{id}:
 *   get:
 *     summary: Get a specific asset by ID
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Asset ID
 *     responses:
 *       200:
 *         description: Asset details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Asset'
 *                 message:
 *                   type: string
 *                   example: "Asset retrieved successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', assetController.getAssetById)

/**
 * @swagger
 * /api/assets:
 *   post:
 *     summary: Create a new asset
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - portfolioId
 *               - symbol
 *               - name
 *               - type
 *               - quantity
 *               - purchasePrice
 *             properties:
 *               portfolioId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *                 description: "Portfolio ID"
 *               symbol:
 *                 type: string
 *                 example: "AAPL"
 *                 description: "Asset symbol"
 *               name:
 *                 type: string
 *                 example: "Apple Inc."
 *                 description: "Asset name"
 *               type:
 *                 type: string
 *                 enum: [stock, cryptocurrency, bond, etf, commodity, real_estate, other]
 *                 example: "stock"
 *                 description: "Asset type"
 *               quantity:
 *                 type: number
 *                 example: 10
 *                 description: "Asset quantity"
 *               purchasePrice:
 *                 type: number
 *                 example: 150.25
 *                 description: "Purchase price per unit"
 *               currentPrice:
 *                 type: number
 *                 example: 175.80
 *                 description: "Current market price per unit"
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-01-15"
 *                 description: "Purchase date"
 *               exchange:
 *                 type: string
 *                 example: "NASDAQ"
 *                 description: "Exchange where asset is traded"
 *               currency:
 *                 type: string
 *                 example: "USD"
 *                 description: "Asset currency"
 *               notes:
 *                 type: string
 *                 example: "Long-term hold"
 *                 description: "Additional notes"
 *     responses:
 *       201:
 *         description: Asset created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Asset'
 *                 message:
 *                   type: string
 *                   example: "Asset created successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', assetController.createAsset)

/**
 * @swagger
 * /api/assets/{id}:
 *   put:
 *     summary: Update an existing asset
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Asset ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               symbol:
 *                 type: string
 *                 example: "AAPL"
 *                 description: "Asset symbol"
 *               name:
 *                 type: string
 *                 example: "Apple Inc."
 *                 description: "Asset name"
 *               type:
 *                 type: string
 *                 enum: [stock, cryptocurrency, bond, etf, commodity, real_estate, other]
 *                 example: "stock"
 *                 description: "Asset type"
 *               quantity:
 *                 type: number
 *                 example: 10
 *                 description: "Asset quantity"
 *               purchasePrice:
 *                 type: number
 *                 example: 150.25
 *                 description: "Purchase price per unit"
 *               currentPrice:
 *                 type: number
 *                 example: 175.80
 *                 description: "Current market price per unit"
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-01-15"
 *                 description: "Purchase date"
 *               exchange:
 *                 type: string
 *                 example: "NASDAQ"
 *                 description: "Exchange where asset is traded"
 *               currency:
 *                 type: string
 *                 example: "USD"
 *                 description: "Asset currency"
 *               notes:
 *                 type: string
 *                 example: "Long-term hold"
 *                 description: "Additional notes"
 *     responses:
 *       200:
 *         description: Asset updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Asset'
 *                 message:
 *                   type: string
 *                   example: "Asset updated successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', assetController.updateAsset)

/**
 * @swagger
 * /api/assets/{id}:
 *   delete:
 *     summary: Delete an asset
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Asset ID
 *     responses:
 *       200:
 *         description: Asset deleted successfully
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
 *                   example: "Asset deleted successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', assetController.deleteAsset)

export default router
