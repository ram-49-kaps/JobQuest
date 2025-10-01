
import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { 
    type: String, 
    required: [true, 'Full name is required'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  phoneNumber: { 
    type: String,
    required: [true, 'Phone number is required'],
    trim: true 
  },
  education: [{
    degree: { 
      type: String, 
      required: [true, 'Degree is required'],
      trim: true 
    },
    institution: { 
      type: String, 
      required: [true, 'Institution is required'],
      trim: true 
    },
    year: { 
      type: String,
      trim: true 
    },
  }],
  experience: [{
    jobTitle: { 
      type: String, 
      required: [true, 'Job title is required'],
      trim: true
    },
    company: { 
      type: String, 
      required: [true, 'Company name is required'],
      trim: true
    },
    duration: { 
      type: String,
      trim: true 
    }
  }],
  skills: [{ 
    type: String, 
    required: [true, 'Skills are required'],
    trim: true 
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

resumeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Resume', resumeSchema);