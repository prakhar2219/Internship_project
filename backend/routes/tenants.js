import express from 'express'
import Tenant from '../models/Tenant.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.post('/:slug/upgrade', requireAuth, requireAdmin, async (req, res) => {
  const { slug } = req.params
  if (req.session.tenant.slug !== slug) return res.status(403).json({ error: 'Forbidden: tenant mismatch' })
  const tenant = await Tenant.findOneAndUpdate({ slug }, { plan: 'PRO' }, { new: true })
  res.json({ success: true, tenant: { slug: tenant.slug, plan: tenant.plan } })
})
router.post("/", async (req, res) => {
  try {
    const { name, slug, plan } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: "name and slug are required" });
    }

    const tenant = new Tenant({
      name,
      slug,
      plan: plan || "FREE"
    });

    await tenant.save();
    res.status(201).json({ message: "Tenant created", tenant });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const tenants = await Tenant.find();
  res.json(tenants);
});

export default router
