import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Tenant from '../models/Tenant.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ error: 'email and password required' })

  const user = await User.findOne({ email }).populate('tenantId')
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      tenantId: user.tenantId._id.toString(),
      role: user.role,
      tenantSlug: user.tenantId.slug,
      plan: user.tenantId.plan,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
  res.json({ token })
})

// REGISTER (only admins can invite new users)
router.post('/register', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { email, password, role } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'email and password required' })

    const passwordHash = await bcrypt.hash(password, 10)

    const user = new User({
      email,
      passwordHash,
      tenantId: req.session.tenant.id,
      role: role === 'MEMBER' ? 'MEMBER' : 'MEMBER',
    })

    await user.save()
    res.status(201).json({ message: 'User created', user: { email: user.email, role: user.role } })
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})

export default router
