import { Router } from 'express'
import { container } from '../container'

const router = Router()
const alertController = container.getAlertController()

// Alert routes
router.get('/', alertController.getAllAlerts)
router.get('/:id', alertController.getAlertById)
router.post('/', alertController.createAlert)
router.put('/:id', alertController.updateAlert)
router.delete('/:id', alertController.deleteAlert)

export default router 