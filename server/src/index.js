import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import http from 'http'
import profileRoutes from './routes/profiles.js'
import categoryRoutes from './routes/categories.js'
import productRoutes from './routes/products.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

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
]

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
app.use(express.json({ limit: '1mb' }))

// Health check (not rate limited)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Move Experience API' })
})

// Apply rate limiters
app.use('/api/', apiLimiter)

// Routes
app.use('/api/profiles', profileRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Global error handler (no stack traces in production)
app.use((err, req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  })
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
