import mongoose from 'mongoose'

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  plan: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' }
}, { timestamps: true })

export default mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema)
