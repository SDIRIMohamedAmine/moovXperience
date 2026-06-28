import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { createContact } from '../controllers/contactController.js'

const router = Router()

// Rate limit contact form: 3 submissions per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: 'Too many contact submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/', contactLimiter, createContact)

export default router
