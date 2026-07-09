const Notification = require('../models/Notification');

// Creates an in-app notification for a user
const notify = async ({ user, title, message, type = 'info', link = '' }) => {
  return Notification.create({ user, title, message, type, link });
};

module.exports = notify;
