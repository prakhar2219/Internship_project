import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Tenant from '../models/Tenant.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export async function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' })
  const m = auth.match(/^Bearer (.+)$/)
  if (!m) return res.status(401).json({ error: 'Malformed Authorization header' })
  const token = m[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    // load fresh user and tenant
    const user = await User.findById(payload.userId).populate('tenantId')
    if (!user) return res.status(401).json({ error: 'Invalid token user' })
    const tenant = await Tenant.findById(user.tenantId._id)
    if (!tenant) return res.status(400).json({ error: 'Tenant not found' })

    // attach session info
    req.session = {
      user: { id: user._id.toString(), email: user.email, role: user.role },
      tenant: { id: tenant._id.toString(), slug: tenant.slug, name: tenant.name, plan: tenant.plan }
    }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireAdmin(req, res, next) {
  if (!req.session) return res.status(401).json({ error: 'Unauthorized' })
  if (req.session.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' })
  next()
}
