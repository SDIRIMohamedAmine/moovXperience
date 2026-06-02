import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  getProducts,
  getProduct,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js'

const router = Router()

router.get('/', getProducts)
router.get('/supplier/me', requireAuth, getMyProducts)
router.get('/:id', getProduct)
router.post('/', requireAuth, createProduct)
router.put('/:id', requireAuth, updateProduct)
router.delete('/:id', requireAuth, deleteProduct)

export default router
