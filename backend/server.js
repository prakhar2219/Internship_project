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
app.use(cors({
  origin: '*'
}))

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/notes', notesRoutes)
app.use('/api/tenants', tenantsRoutes)

const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URI, { autoIndex: true })
  .then(() => {
     console.log("✅ Connected to DB:", mongoose.connection.name);
    console.log('✅ Connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    })
  })
  .catch(err => {
    console.error('❌ MongoDB connection error', err)
  })
