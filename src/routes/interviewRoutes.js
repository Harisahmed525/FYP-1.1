const express = require('express');
const router = express.Router();

const {
  createPreInterviewSetup,
  getUserSetup,
  deletePreInterviewSetup
} = require('../controllers/preInterviewController');

const {
  startInterview,
  sendAnswer,
  finishInterview
} = require('../controllers/SessionController');

const authMiddleware = require('../middlewares/authMiddleware');

// ---------------------------------------------
// Pre-interview setup routes
// ---------------------------------------------
router.post('/setup', authMiddleware, createPreInterviewSetup);
router.get('/setup', authMiddleware, getUserSetup);
router.delete('/setup/:id', authMiddleware, deletePreInterviewSetup);

// ---------------------------------------------
// Interview session routes
// ---------------------------------------------
router.post('/start', authMiddleware, startInterview);
router.post('/answer', authMiddleware, sendAnswer);
router.post('/finish', authMiddleware, finishInterview);

module.exports = router;
