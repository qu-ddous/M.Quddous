const prisma = require('../config/database');

const sendMessage = async (req, res) => {
  try {
    // Use req.user.id as senderId — never trust client-supplied senderId
    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content?.trim()) {
      return res.status(400).json({ error: 'receiverId and content are required' });
    }

    // Run message create + notification in parallel after message is created
    const message = await prisma.message.create({
      data: { senderId, receiverId, content: content.trim() },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        content: true,
        isRead: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
            patient: { select: { fullName: true } },
            doctor: { select: { fullName: true } }
          }
        }
      }
    });

    // Fire-and-forget notification (don't block response)
    prisma.notification.create({
      data: {
        userId: receiverId,
        title: 'New Message',
        message: 'You have received a new message',
        type: 'MESSAGE'
      }
    }).catch(() => {/* non-critical */});

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    if (!otherUserId) {
      return res.status(400).json({ error: 'otherUserId is required' });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        content: true,
        isRead: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            role: true,
            patient: { select: { fullName: true } },
            doctor: { select: { fullName: true } }
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      // Limit to last 100 messages for performance
      take: 100,
    });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.message.update({
      where: { id },
      data: { isRead: true }
    });
    
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markAsRead
};
