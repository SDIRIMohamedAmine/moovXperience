import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  getStats,
  getUsers,
  updateUserRole,
  getAllProducts,
  toggleProductAvailability,
  deleteProductAdmin,
  getAllRentals,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/adminController.js'

const router = Router()

// All admin routes require authentication
router.use(requireAuth)

// Stats
router.get('/stats', getStats)

// Users
router.get('/users', getUsers)
router.patch('/users/:id/role', updateUserRole)

// Products
router.get('/products', getAllProducts)
router.patch('/products/:id/toggle', toggleProductAvailability)
router.delete('/products/:id', deleteProductAdmin)

// Rentals
router.get('/rentals', getAllRentals)

// Categories
router.get('/categories', getAllCategories)
router.post('/categories', createCategory)
router.put('/categories/:id', updateCategory)
router.delete('/categories/:id', deleteCategory)

export default router
