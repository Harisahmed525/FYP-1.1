const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { updateProfile, changePassword } = require("../controllers/authController");

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile settings
 */

// Update Profile
router.put("/update", authMiddleware, updateProfile);

// Change Password
router.put("/update-password", authMiddleware, changePassword);

module.exports = router;
