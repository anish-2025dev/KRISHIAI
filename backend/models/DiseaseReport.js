const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image_url:     { type: String, required: true },
  crop_name:     { type: String },
  disease_name:  { type: String },
  severity:      { type: String, enum: ['Low','Medium','High','Critical'] },
  severity_score:{ type: Number, min: 0, max: 10 },
  symptoms:      [String],
  causes:        [String],
  organic_treatment:  [String],
  chemical_treatment: [String],
  prevention:    [String],
  confidence:    { type: Number },
  raw_analysis:  { type: String },
}, { timestamps: true });

module.exports = mongoose.model('DiseaseReport', diseaseSchema);
