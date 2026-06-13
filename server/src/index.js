import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import http from 'http'
import profileRoutes from './routes/profiles.js'
import categoryRoutes from './routes/categories.js'
import productRoutes from './routes/products.js'
import rentalRoutes from './routes/rentals.js'
import paymentRoutes from './routes/payments.js'
import reviewRoutes from './routes/reviews.js'
import quoteRoutes from './routes/quotes.js'
import adminRoutes from './routes/admin.js'
import adminAuthRoutes from './routes/adminAuth.js'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './swagger.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Startup email config check
console.log('[STARTUP] Email config:', {
  RESEND_API_KEY: process.env.RESEND_API_KEY ? 'SET' : 'MISSING',
  EMAIL_FROM: process.env.EMAIL_FROM ? 'SET' : 'USING DEFAULT',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ? 'SET' : 'MISSING',
  ADMIN_TOKEN_SECRET: process.env.ADMIN_TOKEN_SECRET ? 'SET' : 'MISSING',
})

// Trust proxy for Railway/Vercel
app.set('trust proxy', 1)

// Security headers
app.use(helmet())

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later.' },
})

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  process.env.CLIENT_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

// Body parsing with size limit
app.use(express.json({ limit: '256kb' }))

// Health check (not rate limited)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Swagger docs (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'MoovXperience API Docs',
  }))
}

// Apply rate limiters
app.use('/api/', apiLimiter)
app.use('/api/payments', authLimiter)
app.use('/api/profiles', authLimiter)

// Routes
app.use('/api/profiles', profileRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/rentals', rentalRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/quotes', quoteRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/admin-auth', authLimiter, adminAuthRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Global error handler — never leak internal details
app.use((err, req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: 'Internal server error' })
})

const server = http.createServer(app)

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Kill the other process or change PORT in .env`)
    process.exit(1)
  }
  throw err
})

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
