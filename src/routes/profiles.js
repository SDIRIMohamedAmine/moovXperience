import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getMyProfile, updateMyProfile } from '../controllers/profileController.js'

const router = Router()

router.get('/me', requireAuth, getMyProfile)
router.put('/me', requireAuth, updateMyProfile)

export default router
