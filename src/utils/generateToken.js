const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  });
}

module.exports = generateToken;
