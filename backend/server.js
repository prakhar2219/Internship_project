import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import notesRoutes from './routes/notes.js'
import tenantsRoutes from './routes/tenants.js'

dotenv.config()
const app = express()
app.use(express.json())
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/notes', notesRoutes)
app.use('/api/tenants', tenantsRoutes)

// Cache Mongo connection globally to reuse across invocations
let cached = global.mongoose
if (!cached) cached = global.mongoose = { conn: null, promise: null }

async function connectDB() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, { autoIndex: true }).then(m => m)
  }
  cached.conn = await cached.promise
  return cached.conn
}

// Export handler for Vercel
export default async function handler(req, res) {
  await connectDB()
  app(req, res)
}
