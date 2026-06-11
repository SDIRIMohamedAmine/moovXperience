import { Router } from 'express'
import { initPayment, paymentCallback, paymentWebhook } from '../controllers/paymentController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Client initiates payment for a confirmed rental
router.post('/init', requireAuth, initPayment)

// Konnect redirects here after payment (public)
router.get('/callback', paymentCallback)

// Konnect webhook notification (public)
router.get('/webhook', paymentWebhook)

export default router
