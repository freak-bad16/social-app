import mongoose from 'mongoose';

const rtiRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  ministry: {
    type: String,
    required: true
  },
  ministryAddress: {
    country: { type: String, required: true },
    pinCode: { type: String, required: true },
    areaType: {
      type: String,
      enum: ['Urban', 'Rural'],
      required: true
    }
  },
  article: {
    type: String, 
    required: true
  },
  infoOfRequest: {
    type: String,
    required: true
  },
  justification: {
    type: String, 
  },
  submissionMode: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('RTIRequest', rtiRequestSchema);
