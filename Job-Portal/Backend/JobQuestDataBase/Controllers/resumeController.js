import Resume from '../models/Resume.js';

const validateEmail = (email) => {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Invalid email format');
  }
};

export const saveResume = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, education, experience, skills } = req.body;
    const userId = req.user.id;

    if (!fullName || !email || !education?.length || !experience?.length || !skills?.length) {
      return res.status(400).json({ 
        message: 'All required fields must be provided',
        details: {
          fullName: !fullName ? 'Full name is required' : null,
          email: !email ? 'Email is required' : null,
          education: !education?.length ? 'At least one education entry is required' : null,
          experience: !experience?.length ? 'At least one experience entry is required' : null,
          skills: !skills?.length ? 'At least one skill is required' : null
        }
      });
    }

    validateEmail(email);

    // Validate education data
    const processedEducation = education.map(edu => {
      if (!edu.degree || !edu.institution) {
        throw new Error('Degree and institution are required for each education entry');
      }
      return edu;
    });

    // Validate experience data
    const processedExperience = experience.map(exp => {
      if (!exp.jobTitle || !exp.company || !exp.duration) {
        throw new Error('Job title, company, and duration are required for each experience');
      }
      return exp;
    });

    let resume = await Resume.findOne({ userId });
    if (resume) {
      resume.fullName = fullName;
      resume.email = email;
      resume.phoneNumber = phoneNumber;
      resume.education = processedEducation;
      resume.experience = processedExperience;
      resume.skills = skills;
      resume.updatedAt = Date.now();
    } else {
      resume = new Resume({
        userId,
        fullName,
        email,
        phoneNumber,
        education: processedEducation,
        experience: processedExperience,
        skills,
      });
    }

    await resume.save();
    res.status(201).json({ message: 'Resume saved successfully' });
  } catch (error) {
    console.error('Error saving resume:', error);
    res.status(500).json({ message: 'Failed to save resume', error: error.message });
  }
};