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
import { getAvailability } from '../controllers/rentalController.js'

const router = Router()

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Liste des solutions interactives
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Slug de la catégorie (photobooth, ecrans-led, interactif, gaming, branding)
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Recherche full-text
 *       - in: query
 *         name: mode
 *         schema: { type: string, enum: [rental, sale, both] }
 *         description: Filtrer par mode
 *       - in: query
 *         name: min_price
 *         schema: { type: number }
 *       - in: query
 *         name: max_price
 *         schema: { type: number }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Liste de produits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 *                 total:
 *                   type: integer
 */
router.get('/', getProducts)

/**
 * @swagger
 * /api/products/supplier/me:
 *   get:
 *     summary: Mes solutions (supplier connecté)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des produits du supplier
 */
router.get('/supplier/me', requireAuth, getMyProducts)

/**
 * @swagger
 * /api/products/{id}/availability:
 *   get:
 *     summary: Vérifier la disponibilité d'un produit
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Disponibilité
 */
router.get('/:id/availability', getAvailability)

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Détails d'une solution
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détails du produit
 *       404:
 *         description: Produit non trouvé
 */
router.get('/:id', getProduct)

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Créer une solution
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price_per_day]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               category_id: { type: string, format: uuid }
 *               price_per_day: { type: number }
 *               price_purchase: { type: number }
 *               deposit: { type: number }
 *               stock: { type: integer }
 *               location: { type: string }
 *               images: { type: array, items: { type: string } }
 *               video_url: { type: string }
 *               mode: { type: string, enum: [rental, sale, both] }
 *               options: { type: array, items: { $ref: '#/components/schemas/ProductOption' } }
 *               min_duration: { type: integer }
 *     responses:
 *       201:
 *         description: Produit créé
 */
router.post('/', requireAuth, createProduct)

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Modifier une solution
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Produit modifié
 */
router.put('/:id', requireAuth, updateProduct)

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Supprimer une solution (soft delete)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Produit supprimé
 */
router.delete('/:id', requireAuth, deleteProduct)

export default router
