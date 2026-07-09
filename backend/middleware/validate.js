const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return res.json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};
