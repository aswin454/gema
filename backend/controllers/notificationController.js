const Notification = require('../models/Notification');
const { getDBMode, getStore } = require('../config/db');

/**
 * Get Notifications list
 * Route: GET /api/notifications
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    if (getDBMode()) {
      const store = getStore();
      
      // Return global notifications (recipient = null) plus targeted ones (recipient = userId)
      const list = store.notifications.filter(n => 
        n.recipient === null || n.recipient.toString() === userId
      ).map(n => ({
        ...n,
        read: n.readBy.some(id => id.toString() === userId)
      }));

      res.json(list.reverse()); // latest first
    } else {
      const list = await Notification.find({
        $or: [
          { recipient: null },
          { recipient: req.user._id }
        ]
      }).sort({ createdAt: -1 });

      const mappedList = list.map(n => {
        const obj = n.toObject();
        obj.read = n.readBy.some(id => id.toString() === req.user._id.toString());
        return obj;
      });

      res.json(mappedList);
    }
  } catch (error) {
    console.error('Fetch Notifications Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve notifications list, internal server error' });
  }
};

/**
 * Mark Notifications as Read
 * Route: POST /api/notifications/read
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    if (getDBMode()) {
      const store = getStore();
      
      // Add user to readBy array for all relevant notifications
      store.notifications.forEach(n => {
        if (n.recipient === null || n.recipient.toString() === userId) {
          const alreadyRead = n.readBy.some(id => id.toString() === userId);
          if (!alreadyRead) {
            n.readBy.push(userId);
          }
        }
      });
      res.json({ message: 'Notifications marked as read' });
    } else {
      await Notification.updateMany(
        {
          $or: [
            { recipient: null },
            { recipient: req.user._id }
          ],
          readBy: { $ne: req.user._id }
        },
        {
          $addToSet: { readBy: req.user._id }
        }
      );
      res.json({ message: 'Notifications marked as read' });
    }
  } catch (error) {
    console.error('Mark Notifications Read Error:', error.message);
    res.status(500).json({ message: 'Failed to update notification logs, internal server error' });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
