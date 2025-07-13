import { Router } from 'express'
import { AlertController } from './controller'
import { AlertService } from './service'
import { AlertRepository } from './repository'

const router = Router()

// Create instances
const alertRepository = new AlertRepository()
const alertService = new AlertService(alertRepository)
const alertController = new AlertController(alertService)

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Get all alerts for the authenticated user
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's alerts
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
 *                     $ref: '#/components/schemas/Alert'
 *                 message:
 *                   type: string
 *                   example: "Alerts retrieved successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', alertController.getAllAlerts)

/**
 * @swagger
 * /api/alerts/{id}:
 *   get:
 *     summary: Get a specific alert by ID
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Alert'
 *                 message:
 *                   type: string
 *                   example: "Alert retrieved successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', alertController.getAlertById)

/**
 * @swagger
 * /api/alerts:
 *   post:
 *     summary: Create a new alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - symbol
 *               - type
 *               - condition
 *               - message
 *             properties:
 *               symbol:
 *                 type: string
 *                 example: "AAPL"
 *                 description: "Asset symbol to watch"
 *               type:
 *                 type: string
 *                 enum: [price_above, price_below, percent_change, volume_spike, news]
 *                 example: "price_above"
 *                 description: "Alert type"
 *               condition:
 *                 type: number
 *                 example: 200.00
 *                 description: "Alert condition value"
 *               message:
 *                 type: string
 *                 example: "AAPL reached $200"
 *                 description: "Alert message"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *                 description: "Whether alert is active (default: true)"
 *     responses:
 *       201:
 *         description: Alert created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Alert'
 *                 message:
 *                   type: string
 *                   example: "Alert created successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', alertController.createAlert)

/**
 * @swagger
 * /api/alerts/{id}:
 *   put:
 *     summary: Update an existing alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Alert ID
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
 *                 description: "Asset symbol to watch"
 *               type:
 *                 type: string
 *                 enum: [price_above, price_below, percent_change, volume_spike, news]
 *                 example: "price_above"
 *                 description: "Alert type"
 *               condition:
 *                 type: number
 *                 example: 200.00
 *                 description: "Alert condition value"
 *               message:
 *                 type: string
 *                 example: "AAPL reached $200"
 *                 description: "Alert message"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *                 description: "Whether alert is active"
 *     responses:
 *       200:
 *         description: Alert updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Alert'
 *                 message:
 *                   type: string
 *                   example: "Alert updated successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', alertController.updateAlert)

/**
 * @swagger
 * /api/alerts/{id}:
 *   delete:
 *     summary: Delete an alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert deleted successfully
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
 *                   example: "Alert deleted successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', alertController.deleteAlert)

export default router
