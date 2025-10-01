import express from 'express';
import Candidate from '../models/Candidate.js'; // Assuming you have a Candidate model

const router = express.Router();

// GET all candidates
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update candidate status
router.put('/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;