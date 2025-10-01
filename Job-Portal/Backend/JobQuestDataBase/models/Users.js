import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email address'],
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?[\d\s-]{7,15}$/, 'Please provide a valid phone number'],
  },
  password: {
    type: String,
    required: function() {
      return true; // Password is always required
    },
    minlength: [6, 'Password must be at least 6 characters long'],
  },

  profilePicture: {
    type: String,
    default: '/uploads/profiles/default-profile.jpg',
  },
  role: {
    type: String,
    enum: ['Job Seeker', 'Recruiter'],
    required: true,
    index: true,
  },
  resume: {
    type: {
      fullName: { type: String, trim: true },
      email: { type: String, trim: true },
      phoneNumber: { type: String, trim: true },
      education: [
        {
          degree: { type: String, trim: true },
          institution: { type: String, trim: true },
          year: { type: String, trim: true },
        },
      ],
      experience: [
        {
          jobTitle: { type: String, trim: true },
          company: { type: String, trim: true },
          duration: { type: String, trim: true },
        },
      ],
      skills: [{ type: String, trim: true }],
    },
    default: null,
  },
  company: {
    type: {
      name: { type: String, required: true, trim: true },
      description: { type: String, required: true, trim: true },
      location: { type: String, trim: true }, // Optional
      website: {
        type: String,
        trim: true,
        match: [/^(https?:\/\/)?[^\s/$.?#].[^\s]*$/, 'Please provide a valid URL'], // Relaxed to accept domains
      }, // Optional
      industry: { type: String, trim: true }, // Optional
      size: { type: String, trim: true }, // Optional
      logo: {
        type: String,
        default: '/uploads/profiles/default-company.jpg',
      },
      employees: { type: Number, min: [0, 'Employees cannot be negative'] }, // Optional
      status: { type: String, default: 'Active', enum: ['Active', 'Inactive'] },
    },
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  savedJobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
  ],
  resetPasswordExpiry: {
    type: Date,
    default: null,
  },
});

// Add password comparison method
userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) {
    throw new Error('Password not set for this user');
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);