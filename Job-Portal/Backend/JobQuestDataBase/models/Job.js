import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  jobType: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive']
  },
  salary: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  logo: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'Active'
  },
  applicationDeadline: {
    type: Date,
    required: true
  },
  skills: {
    type: [String],
    default: []
  },
  requirements: {
    type: [String],
    default: []
  },
  responsibilities: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

export default mongoose.model('Job', jobSchema);