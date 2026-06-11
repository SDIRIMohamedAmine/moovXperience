import { Router } from 'express'
import { createReview, getProductReviews, checkReviewEligibility } from '../controllers/reviewController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Create a review (authenticated, client only)
router.post('/', requireAuth, createReview)

// Get reviews for a product (public)
router.get('/product/:productId', getProductReviews)

// Check if client can review a rental (authenticated)
router.get('/check/:rentalId', requireAuth, checkReviewEligibility)

export default router
