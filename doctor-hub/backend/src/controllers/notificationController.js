const prisma = require('../config/database');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,  // only last 20 — prevents slow queries
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        createdAt: true,
      }
    });

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead
};
