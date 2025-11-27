const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },

  // store hashed password
  passwordHash: { 
    type: String, 
    required: true 
  },

  // OPTIONAL → does not break existing flow
  dob: {
    type: Date,
    default: null
  },

  citizenship: {
    type: String,
    default: ""
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model('User', userSchema);
