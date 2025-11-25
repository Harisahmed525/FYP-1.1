const PreInterview = require('../models/PreInterview');
const mongoose = require('mongoose');

// Create a pre-interview setup
// Expected body: { userId, selectedRole|desiredRole, industry, educationLevel, experienceLevel }
exports.createPreInterviewSetup = async (req, res, next) => {
  try {
    // userId will come from auth middleware (req.user.id)
    const tokenUserId = req.user && req.user.id;
    const { desiredRole, industry, educationLevel, experienceLevel } = req.body || {};

    if (!tokenUserId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // require core fields
    if (!experienceLevel) {
      return res.status(400).json({ message: 'Missing required field: experienceLevel' });
    }

    // validate token userId
    if (!mongoose.Types.ObjectId.isValid(tokenUserId)) {
      return res.status(400).json({ message: 'Invalid user id in token' });
    }

    // require desiredRole
    if (!desiredRole) {
      return res.status(400).json({ message: 'desiredRole is required' });
    }

    const setup = new PreInterview({
      userId: tokenUserId,
      desiredRole,
      industry,
      educationLevel,
      experienceLevel,
    });
    await setup.save();

    res.status(201).json({ setup });
  } catch (err) {
    next(err);
  }
};

// Get user's latest pre-interview setup
// Query: /api/interview/setup?userId=<id>&latest=true
exports.getUserSetup = async (req, res, next) => {
  try {
    // If authenticated, use token user id; otherwise allow query userId (less preferred)
    const tokenUserId = req.user && req.user.id;
    const queryUserId = req.query.userId || req.body.userId;
    const userId = tokenUserId || queryUserId;

    if (!userId) return res.status(400).json({ message: 'userId is required (provide token or userId)' });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format: expected a MongoDB ObjectId' });
    }

    const latestOnly = req.query.latest === 'true' || req.query.latest === true;

    if (latestOnly) {
      const latest = await PreInterview.findOne({ userId }).sort({ createdAt: -1 }).lean();
      return res.json({ setup: latest });
    }

    const setups = await PreInterview.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json({ setups });
  } catch (err) {
    next(err);
  }
};

// Delete a pre-interview setup by id
exports.deletePreInterviewSetup = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'id is required' });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid id format: expected a MongoDB ObjectId' });
    }

    const deleted = await PreInterview.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Setup not found' });

    res.json({ message: 'Deleted', id: deleted._id });
  } catch (err) {
    next(err);
  }
};
