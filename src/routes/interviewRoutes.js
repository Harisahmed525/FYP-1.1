const express = require('express');
const router = express.Router();

const {
  createPreInterviewSetup,
  getUserSetup,
  deletePreInterviewSetup
} = require('../controllers/preInterviewController');

const { generateQuestions } = require('../controllers/aiController');

const {
  startInterview,
  sendAnswer,
  logEmotion,
  uploadVideo,
  finishInterview
} = require ('../controllers/interviewSessionController');


const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../utils/upload');

// ---------------------------
//   EXISTING ROUTES (KEEP)
// ---------------------------
router.post('/setup', authMiddleware, createPreInterviewSetup);
router.get('/setup', authMiddleware, getUserSetup);
router.delete('/setup/:id', authMiddleware, deletePreInterviewSetup);

router.post('/generate-questions', authMiddleware, generateQuestions);

// -------------------------------------------------
//   NEW INTERVIEW SESSION ROUTES (ADDED NOW)
// -------------------------------------------------

// 1️⃣ Start a new interview session
router.post('/start', authMiddleware, startInterview);

// 2️⃣ Send user answer → Get next AI question
router.post('/answer', authMiddleware, sendAnswer);

// 3️⃣ Log real-time emotion data from frontend
router.post('/emotion-log', authMiddleware, logEmotion);

// 4️⃣ Upload interview video via multer → Firebase
router.post('/upload-video', authMiddleware, upload.single("video"), uploadVideo);

// 5️⃣ Finish session + run AI evaluation
router.post('/finish', authMiddleware, finishInterview);

module.exports = router;
