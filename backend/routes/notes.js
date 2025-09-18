import express from 'express'
import Note from '../models/Note.js'
import Tenant from '../models/Tenant.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.use(requireAuth)

router.get('/', async (req, res) => {
  const notes = await Note.find({ tenantId: req.session.tenant.id }).sort({ createdAt: -1 })
  res.json(notes)
})

router.post('/', async (req, res) => {
  const { title, content } = req.body
  if (!title) return res.status(400).json({ error: 'title required' })

  const tenant = await Tenant.findById(req.session.tenant.id)
  if (!tenant) return res.status(400).json({ error: 'Tenant not found' })

  if (tenant.plan === 'FREE') {
    const count = await Note.countDocuments({ tenantId: tenant._id })
    if (count >= 3) return res.status(403).json({ error: 'Free plan note limit reached' })
  }

  const note = new Note({ title, content: content || '', tenantId: tenant._id })
  await note.save()
  res.status(201).json(note)
})

router.get('/:id', async (req, res) => {
  const note = await Note.findById(req.params.id)
  if (!note) return res.status(404).json({ error: 'Not found' })
  if (note.tenantId.toString() !== req.session.tenant.id) return res.status(403).json({ error: 'Forbidden' })
  res.json(note)
})

router.put('/:id', async (req, res) => {
  const note = await Note.findById(req.params.id)
  if (!note) return res.status(404).json({ error: 'Not found' })
  if (note.tenantId.toString() !== req.session.tenant.id) return res.status(403).json({ error: 'Forbidden' })
  const { title, content } = req.body
  note.title = title ?? note.title
  note.content = content ?? note.content
  await note.save()
  res.json(note)
})

router.delete('/:id', async (req, res) => {
  const note = await Note.findById(req.params.id)
  if (!note) return res.status(404).json({ error: 'Not found' })
  if (note.tenantId.toString() !== req.session.tenant.id) return res.status(403).json({ error: 'Forbidden' })
  await note.deleteOne()
  res.json({ success: true })
})

export default router
