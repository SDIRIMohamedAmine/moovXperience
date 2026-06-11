import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  createRental,
  getRentals,
  updateRentalStatus,
} from '../controllers/rentalController.js'

const router = Router()

router.post('/', requireAuth, createRental)
router.get('/', requireAuth, getRentals)
router.patch('/:id/status', requireAuth, updateRentalStatus)

export default router
