const bcrypt = require('bcrypt');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// ----------------------------------
// VALIDATION HELPERS
// ----------------------------------
function validateEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return typeof password === "string" && password.length >= 6;
}

// ----------------------------------
// REGISTER USER (UPDATED with dob + citizenship)
// ----------------------------------
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, dob, citizenship } = req.body || {};

    // Required fields
    if (!name || !email || !password || !dob || !citizenship)
      return res.status(400).json({
        message: "name, email, password, dob and citizenship are required"
      });

    if (!validateEmail(email))
      return res.status(400).json({ message: "Invalid email format" });

    if (!validatePassword(password))
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(409).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      dob,
      citizenship
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "Register Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        citizenship: user.citizenship,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

// ----------------------------------
// LOGIN USER
// ----------------------------------
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password)
      return res.status(400).json({ message: "email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.json({
      message: "Login Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        citizenship: user.citizenship,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

// ----------------------------------
// GET LOGGED-IN USER
// ----------------------------------
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        citizenship: user.citizenship,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ----------------------------------
// UPDATE PROFILE (updated to allow dob + citizenship)
// ----------------------------------
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email, dob, citizenship } = req.body || {};

    if (!name && !email && !dob && !citizenship)
      return res.status(400).json({ message: "No fields to update" });

    let updateData = {};

    if (name) updateData.name = name.trim();

    if (dob) updateData.dob = dob;

    if (citizenship) updateData.citizenship = citizenship;

    if (email) {
      if (!validateEmail(email))
        return res.status(400).json({ message: "Invalid email format" });

      const exists = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: userId },
      });

      if (exists)
        return res.status(409).json({ message: "Email already taken" });

      updateData.email = email.toLowerCase().trim();
    }

    const updated = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-passwordHash");

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        dob: updated.dob,
        citizenship: updated.citizenship,
        createdAt: updated.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ----------------------------------
// CHANGE PASSWORD (unchanged)
// ----------------------------------
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body || {};

    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Both passwords are required" });

    if (!validatePassword(newPassword))
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!match)
      return res.status(401).json({ message: "Incorrect old password" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};
