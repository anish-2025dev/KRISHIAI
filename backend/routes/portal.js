const express  = require('express')
const mongoose = require('mongoose')
const { protect } = require('../middleware/auth')

const router = express.Router()

// ── Schemas ──────────────────────────────────────────────────────

const requirementSchema = new mongoose.Schema({
  company_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company_name: { type: String, required: true },
  company_phone:{ type: String },
  crop:         { type: String, required: true },
  quantity_tons:{ type: Number, required: true },
  price_per_ton:{ type: Number, required: true },
  quality_grade:{ type: String },
  location:     { type: String, required: true },
  state:        { type: String },
  deadline:     { type: Date },
  description:  { type: String },
  contact_email:{ type: String },
  is_active:    { type: Boolean, default: true },
  applicants:   [{ farmer_id: mongoose.Schema.Types.ObjectId, farmer_name: String, phone: String, quantity: Number, message: String, applied_at: Date }],
}, { timestamps: true })

const insuranceSchema = new mongoose.Schema({
  provider_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider_name: { type: String, required: true },
  plan_name:     { type: String, required: true },
  crop_covered:  [String],
  premium_per_acre:   { type: Number, required: true },
  max_coverage_per_acre:{ type: Number, required: true },
  duration_months:    { type: Number, required: true },
  features:      [String],
  claim_process: { type: String },
  contact_phone: { type: String },
  contact_email: { type: String },
  website_url:   { type: String },
  logo_url:      { type: String },
  states_covered:[String],
  is_active:     { type: Boolean, default: true },
  is_approved:   { type: Boolean, default: false }, // Admin approves
}, { timestamps: true })

const transportSchema = new mongoose.Schema({
  provider_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider_name: { type: String, required: true },
  vehicle_type:  { type: String, required: true }, // Truck, Mini Truck, Tempo, etc
  vehicle_number:{ type: String },
  capacity_tons: { type: Number, required: true },
  rate_per_km:   { type: Number, required: true },
  rate_per_ton:  { type: Number },
  base_location: { type: String, required: true },
  state:         { type: String },
  routes:        [String], // e.g. ["Jaipur to Delhi", "Rajasthan to Punjab"]
  contact_phone: { type: String, required: true },
  available:     { type: Boolean, default: true },
  crops_handled: [String],
  has_refrigeration:{ type: Boolean, default: false },
  description:   { type: String },
}, { timestamps: true })

const Requirement = mongoose.model('Requirement', requirementSchema)
const Insurance   = mongoose.model('Insurance',   insuranceSchema)
const Transport   = mongoose.model('Transport',   transportSchema)

// ════════════════════════════════════════════════════════════════
// COMPANY REQUIREMENTS
// ════════════════════════════════════════════════════════════════

// POST /api/portal/requirements  — company posts requirement
router.post('/requirements', protect, async (req, res) => {
  try {
    if (req.user.role !== 'company' && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Only companies can post requirements' })

    const req_data = await Requirement.create({
      company_id:    req.user._id,
      company_name:  req.body.company_name || req.user.name,
      company_phone: req.body.company_phone || req.user.phone,
      crop:          req.body.crop,
      quantity_tons: req.body.quantity_tons,
      price_per_ton: req.body.price_per_ton,
      quality_grade: req.body.quality_grade,
      location:      req.body.location,
      state:         req.body.state,
      deadline:      req.body.deadline,
      description:   req.body.description,
      contact_email: req.body.contact_email,
    })
    res.status(201).json({ success: true, requirement: req_data })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/portal/requirements  — farmers & companies browse
router.get('/requirements', async (req, res) => {
  try {
    const { crop, state, limit = 20 } = req.query
    const filter = { is_active: true }
    if (crop)  filter.crop  = new RegExp(crop, 'i')
    if (state) filter.state = new RegExp(state, 'i')

    const reqs = await Requirement.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
    res.json({ success: true, requirements: reqs })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/portal/requirements/mine  — company sees their own
router.get('/requirements/mine', protect, async (req, res) => {
  try {
    const reqs = await Requirement.find({ company_id: req.user._id }).sort({ createdAt: -1 })
    res.json({ success: true, requirements: reqs })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/portal/requirements/:id/apply  — farmer applies
router.post('/requirements/:id/apply', protect, async (req, res) => {
  try {
    const req_doc = await Requirement.findById(req.params.id)
    if (!req_doc) return res.status(404).json({ success: false, message: 'Requirement not found' })

    const alreadyApplied = req_doc.applicants.some(a => a.farmer_id?.toString() === req.user._id.toString())
    if (alreadyApplied) return res.status(400).json({ success: false, message: 'Already applied' })

    req_doc.applicants.push({
      farmer_id:   req.user._id,
      farmer_name: req.user.name,
      phone:       req.user.phone,
      quantity:    req.body.quantity,
      message:     req.body.message,
      applied_at:  new Date(),
    })
    await req_doc.save()
    res.json({ success: true, message: 'Applied successfully! Company will contact you.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/portal/requirements/:id
router.delete('/requirements/:id', protect, async (req, res) => {
  try {
    const req_doc = await Requirement.findById(req.params.id)
    if (!req_doc) return res.status(404).json({ success: false, message: 'Not found' })
    if (req_doc.company_id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' })
    await Requirement.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Requirement deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ════════════════════════════════════════════════════════════════
// INSURANCE PLANS
// ════════════════════════════════════════════════════════════════

// POST /api/portal/insurance  — provider submits plan (needs admin approval)
router.post('/insurance', protect, async (req, res) => {
  try {
    if (req.user.role !== 'insurance' && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Only insurance providers can add plans' })

    const plan = await Insurance.create({
      provider_id:          req.user._id,
      provider_name:        req.body.provider_name || req.user.name,
      plan_name:            req.body.plan_name,
      crop_covered:         req.body.crop_covered || [],
      premium_per_acre:     req.body.premium_per_acre,
      max_coverage_per_acre:req.body.max_coverage_per_acre,
      duration_months:      req.body.duration_months,
      features:             req.body.features || [],
      claim_process:        req.body.claim_process,
      contact_phone:        req.body.contact_phone || req.user.phone,
      contact_email:        req.body.contact_email,
      website_url:          req.body.website_url,
      states_covered:       req.body.states_covered || [],
      is_approved:          req.user.role === 'admin', // Admin auto-approved
    })
    res.status(201).json({ success: true, plan, message: req.user.role === 'admin' ? 'Plan added and approved' : 'Plan submitted for admin approval' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/portal/insurance  — public listing (approved only)
router.get('/insurance', async (req, res) => {
  try {
    const { crop, state } = req.query
    const filter = { is_active: true, is_approved: true }
    if (crop)  filter.crop_covered = new RegExp(crop, 'i')
    if (state) filter.states_covered = new RegExp(state, 'i')

    const plans = await Insurance.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, plans })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/portal/insurance/mine
router.get('/insurance/mine', protect, async (req, res) => {
  try {
    const plans = await Insurance.find({ provider_id: req.user._id }).sort({ createdAt: -1 })
    res.json({ success: true, plans })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/portal/insurance/:id/approve  — admin only
router.put('/insurance/:id/approve', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Admin only' })
    const plan = await Insurance.findByIdAndUpdate(req.params.id, { is_approved: true }, { new: true })
    res.json({ success: true, plan, message: 'Plan approved and now visible to farmers' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ════════════════════════════════════════════════════════════════
// TRANSPORT LISTINGS
// ════════════════════════════════════════════════════════════════

// POST /api/portal/transport  — transporter lists vehicle
router.post('/transport', protect, async (req, res) => {
  try {
    if (req.user.role !== 'transport' && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Only transport providers can add vehicles' })

    const listing = await Transport.create({
      provider_id:       req.user._id,
      provider_name:     req.body.provider_name || req.user.name,
      vehicle_type:      req.body.vehicle_type,
      vehicle_number:    req.body.vehicle_number,
      capacity_tons:     req.body.capacity_tons,
      rate_per_km:       req.body.rate_per_km,
      rate_per_ton:      req.body.rate_per_ton,
      base_location:     req.body.base_location,
      state:             req.body.state,
      routes:            req.body.routes || [],
      contact_phone:     req.body.contact_phone || req.user.phone,
      crops_handled:     req.body.crops_handled || [],
      has_refrigeration: req.body.has_refrigeration || false,
      description:       req.body.description,
    })
    res.status(201).json({ success: true, listing })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/portal/transport  — public listing
router.get('/transport', async (req, res) => {
  try {
    const { state, vehicle_type } = req.query
    const filter = { available: true }
    if (state)        filter.state        = new RegExp(state, 'i')
    if (vehicle_type) filter.vehicle_type = new RegExp(vehicle_type, 'i')

    const listings = await Transport.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, listings })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/portal/transport/mine
router.get('/transport/mine', protect, async (req, res) => {
  try {
    const listings = await Transport.find({ provider_id: req.user._id }).sort({ createdAt: -1 })
    res.json({ success: true, listings })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/portal/transport/:id/toggle  — toggle availability
router.put('/transport/:id/toggle', protect, async (req, res) => {
  try {
    const listing = await Transport.findById(req.params.id)
    if (!listing) return res.status(404).json({ success: false, message: 'Not found' })
    if (listing.provider_id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' })
    listing.available = !listing.available
    await listing.save()
    res.json({ success: true, available: listing.available })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ════════════════════════════════════════════════════════════════
// ADMIN — get pending insurance plans
// ════════════════════════════════════════════════════════════════
router.get('/admin/pending-insurance', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Admin only' })
    const plans = await Insurance.find({ is_approved: false }).sort({ createdAt: -1 })
    res.json({ success: true, plans })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
