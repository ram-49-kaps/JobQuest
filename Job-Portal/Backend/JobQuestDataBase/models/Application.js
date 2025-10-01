import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  jobSeekerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  recruiterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Not Hired', 'Processing'],
    default: 'Pending',
  },
  statusMessage: {
    type: String,
    default: 'Your application is being reviewed.'
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update pre-save middleware for new status messages
ApplicationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    switch(this.status) {
      case 'Pending':
        this.statusMessage = 'Your application is being reviewed.';
        break;
      case 'Approved':
        this.statusMessage = 'Congratulations! Your application has been approved.';
        break;
      case 'Not Hired':
        this.statusMessage = 'Thank you for your interest. Unfortunately, we have decided to move forward with other candidates.';
        break;
      case 'Processing':
        this.statusMessage = 'Your application is currently being processed. We will update you soon.';
        break;
    }
    this.notificationSent = false;
    this.updatedAt = Date.now();
  }
  next();
});

// Static method to find applications by job seeker
ApplicationSchema.statics.findByJobSeeker = function(jobSeekerId) {
  return this.find({ jobSeekerId })
    .populate('jobId')
    .populate({
      path: 'recruiterId',
      select: 'fullName email company',
      populate: {
        path: 'company',
        select: 'name logo'
      }
    })
    .sort({ updatedAt: -1 });
};

// Static method to find applications by recruiter
ApplicationSchema.statics.findByRecruiter = function(recruiterId) {
  return this.find({ recruiterId })
    .populate('jobSeekerId', 'fullName email resume')
    .populate('jobId')
    .populate({
      path: 'recruiterId',
      select: 'fullName email company',
      populate: {
        path: 'company',
        select: 'name logo'
      }
    })
    .sort({ updatedAt: -1 });
};

export default mongoose.model('Application', ApplicationSchema);