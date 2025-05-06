// models/RtiApplication.js
const mongoose = require('mongoose');

const RtiApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  aadharNumber: { type: String, required: true },

  ministry: { type: String, required: true },
  article: { type: String, required: true },
  infoOfRequest: { type: String, required: true },
  justification: { type: String },

  submissionMode: { type: String, enum: ['Online', 'Offline'], required: true },
  povertyLevel: { type: String, enum: ['APL', 'BPL'], required: true },
  address: {
    pinCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  areaType: { type: String, enum: ['Urban', 'Rural'], required: true },

  password: { type: String, required: true }, // should be hashed before saving
}, {
  timestamps: true // adds createdAt and updatedAt
});

module.exports = mongoose.model('RtiApplication', RtiApplicationSchema);
