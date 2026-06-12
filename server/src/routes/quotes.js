import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { createQuote, getAllQuotes, getClientQuotes, updateQuoteStatus } from '../controllers/quoteController.js'

const router = Router()

/**
 * @swagger
 * /api/quotes:
 *   post:
 *     summary: Demander un devis
 *     tags: [Quotes]
 *     description: Soumettre une demande de devis (authentification optionnelle)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, client_name, client_email, mode, estimated_total]
 *             properties:
 *               product_id: { type: string, format: uuid }
 *               client_name: { type: string }
 *               client_email: { type: string, format: email }
 *               client_phone: { type: string }
 *               company_name: { type: string }
 *               mode: { type: string, enum: [rental, purchase] }
 *               duration_days: { type: integer }
 *               options: { type: array, items: { $ref: '#/components/schemas/ProductOption' } }
 *               event_date: { type: string, format: date }
 *               event_location: { type: string }
 *               notes: { type: string }
 *               estimated_total: { type: number }
 *     responses:
 *       201:
 *         description: Devis créé
 *       400:
 *         description: Données invalides
 */
router.post('/', (req, res, next) => {
  if (req.headers.authorization) {
    return requireAuth(req, res, next)
  }
  req.user = { id: null }
  next()
}, createQuote)

/**
 * @swagger
 * /api/quotes/all:
 *   get:
 *     summary: Tous les devis (admin)
 *     tags: [Quotes]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des devis
 */
router.get('/all', requireAuth, requireAdmin, getAllQuotes)

/**
 * @swagger
 * /api/quotes/client/me:
 *   get:
 *     summary: Mes demandes de devis (client)
 *     tags: [Quotes]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des devis
 */
router.get('/client/me', requireAuth, getClientQuotes)

/**
 * @swagger
 * /api/quotes/{id}/status:
 *   patch:
 *     summary: Mettre à jour le statut d'un devis
 *     tags: [Quotes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [sent, accepted, rejected, expired] }
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
router.patch('/:id/status', requireAuth, requireAdmin, updateQuoteStatus)

export default router
