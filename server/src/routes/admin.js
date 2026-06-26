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
  getRentalDetails,
  deleteRental,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSettings,
  updateSetting,
  upsertPage,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getAllBlogPosts,
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
router.get('/rentals/:id', getRentalDetails)
router.delete('/rentals/:id', deleteRental)

// Categories
router.get('/categories', getAllCategories)
router.post('/categories', createCategory)
router.put('/categories/:id', updateCategory)
router.delete('/categories/:id', deleteCategory)

// Settings
router.get('/settings', getSettings)
router.put('/settings', updateSetting)

// Pages (CMS)
router.put('/pages/:slug', upsertPage)

// Blog
router.get('/blog', getAllBlogPosts)
router.post('/blog', createBlogPost)
router.put('/blog/:id', updateBlogPost)
router.delete('/blog/:id', deleteBlogPost)

export default router
