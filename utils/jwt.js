const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

exports.makeToken = (payload) => jwt.sign(payload, SECRET, { expiresIn: '1h' });
exports.verifyToken = (token) => jwt.verify(token, SECRET);
