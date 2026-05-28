const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  phone:    { type: String, required: true, unique: true, trim: true },
  email:    { type: String, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ['farmer','company','insurance','transport','admin'], default: 'farmer' },
  location: {
    state:    { type: String, default: 'Rajasthan' },
    district: { type: String },
    village:  { type: String },
    lat:      { type: Number },
    lng:      { type: Number },
  },
  land_acres:  { type: Number, default: 0 },
  soil_type:   { type: String, default: 'Loamy' },
  crops:       [{ type: String }],
  avatar:      { type: String },
  is_verified: { type: Boolean, default: false },
  language:    { type: String, enum: ['hindi','english','hinglish'], default: 'hindi' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
