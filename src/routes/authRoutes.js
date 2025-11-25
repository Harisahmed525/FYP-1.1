const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

// ----------------------
// Auth Routes
// ----------------------

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 */
router.post("/login", loginUser);

module.exports = router;
