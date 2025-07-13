import { Router } from 'express'
import { AlertController } from './controller'
import { AlertService } from './service'
import { AlertRepository } from './repository'

const router = Router()

// Create instances
const alertRepository = new AlertRepository()
const alertService = new AlertService(alertRepository)
const alertController = new AlertController(alertService)

// Alert routes
router.get('/', alertController.getAllAlerts)
router.get('/:id', alertController.getAlertById)
router.post('/', alertController.createAlert)
router.put('/:id', alertController.updateAlert)
router.delete('/:id', alertController.deleteAlert)

export default router 