const Notification = require('../models/Notification');
const { getDBMode, getStore } = require('../config/db');

// Placeholders for socket instance reference
let ioInstance = null;

const setIoInstance = (io) => {
  ioInstance = io;
};

const createServerNotification = async ({ recipient, title, message, type }) => {
  try {
    let savedNotification = null;

    if (getDBMode()) {
      const store = getStore();
      savedNotification = {
        _id: new Date().getTime().toString(),
        recipient: recipient ? recipient.toString() : null,
        title,
        message,
        type: type || 'info',
        readBy: [],
        createdAt: new Date()
      };
      store.notifications.push(savedNotification);
    } else {
      const notification = await Notification.create({
        recipient: recipient || null,
        title,
        message,
        type: type || 'info'
      });
      savedNotification = notification.toObject();
    }

    // Broadcast through socket.io if instance is loaded
    if (ioInstance) {
      if (recipient) {
        // Targeted notification to specific user channel
        ioInstance.to(recipient.toString()).emit('notification', savedNotification);
      } else {
        // Global broadcast
        ioInstance.emit('notification', savedNotification);
      }
    }

    return savedNotification;
  } catch (error) {
    console.error('Create Notification Service Error:', error.message);
  }
};

module.exports = {
  setIoInstance,
  createServerNotification
};
