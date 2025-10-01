import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: { type: String, required: true },
  location: { type: String, required: true },
  employees: { type: Number, required: true },
  website: { type: String, required: true },
  logo: {
    type: String,
    default: ''
  },
  description: { type: String, default: '' },
  status: { type: String, default: 'Active' }
}, {
  timestamps: true
});

export default mongoose.model('Company', companySchema);