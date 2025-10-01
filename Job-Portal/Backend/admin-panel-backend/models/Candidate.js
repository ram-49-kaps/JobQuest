import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, default: 'Reviewing' },
  appliedDate: { type: Date, default: Date.now }
});

export default mongoose.model('Candidate', candidateSchema);