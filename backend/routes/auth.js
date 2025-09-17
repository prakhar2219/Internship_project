import express from 'express'
import User from '../models/User.js'
import Tenant from '../models/Tenant.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  const user = await User.findOne({ email }).populate('tenantId')
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ userId: user._id.toString(), tenantId: user.tenantId._id.toString(), role: user.role, tenantSlug: user.tenantId.slug, plan: user.tenantId.plan }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})
router.post("/register", async (req, res) => {
  try {
    const { email, password, tenantSlug } = req.body;
    if (!email || !password || !tenantSlug) {
      return res.status(400).json({ error: "email, password, and tenantSlug are required" });
    }

    // find tenant by slug
    const tenant = await Tenant.findOne({ slug: tenantSlug });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // create user
    const user = new User({
      email,
      passwordHash,
      tenantId: tenant._id,
      role: role || "MEMBER",
    });

    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

export default router
