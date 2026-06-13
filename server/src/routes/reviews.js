import { Router } from 'express'
import { createReview, getProductReviews, checkReviewEligibility, getRecentReviews } from '../controllers/reviewController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Create a review (authenticated, client only)
router.post('/', requireAuth, createReview)

// Get recent reviews (public, for homepage)
router.get('/recent', getRecentReviews)

// Get reviews for a product (public)
router.get('/product/:productId', getProductReviews)

// Check if client can review a rental (authenticated)
router.get('/check/:rentalId', requireAuth, checkReviewEligibility)

export default router
