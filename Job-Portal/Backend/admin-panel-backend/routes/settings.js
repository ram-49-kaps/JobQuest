import express from 'express';
import Admin from '../models/Admin.js';
import auth from '../middleware/auth.js'; // Assuming this middleware verifies the admin token

const router = express.Router();

// GET Admin Settings
router.get('/', auth, async (req, res) => {
  try {
    const admin = await Admin.findOne(); // Assuming single admin for simplicity
    if (!admin) {
      return res.status(404).json({ message: 'Admin settings not found' });
    }
    res.json({
      company: admin.company,
      email: admin.email,
      emailNotifications: admin.emailNotifications,
    });
  } catch (error) {
    console.error('GET /settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT Update Admin Settings
router.put('/', auth, async (req, res) => {
  const { company, email, emailNotifications, currentPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({ message: 'Admin settings not found' });
    }

    // Verify current password (for simplicity, assuming plain text; use hashing in production)
    if (currentPassword && newPassword) {
      if (admin.password !== currentPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      admin.password = newPassword;
    }

    // Update fields if provided
    if (company) admin.company = company;
    if (email) admin.email = email;
    if (typeof emailNotifications === 'boolean') admin.emailNotifications = emailNotifications;

    admin.updatedAt = Date.now();
    await admin.save();

    res.json({
      company: admin.company,
      email: admin.email,
      emailNotifications: admin.emailNotifications,
    });
  } catch (error) {
    console.error('PUT /settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;