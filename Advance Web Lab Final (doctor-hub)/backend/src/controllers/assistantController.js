const prisma = require('../config/database');

const getAssistantProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const assistant = await prisma.assistant.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });
    
    if (!assistant) {
      return res.status(404).json({ error: 'Assistant profile not found' });
    }
    
    res.json(assistant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch assistant profile' });
  }
};

const updateAssistantProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, department, about } = req.body;
    
    const assistant = await prisma.assistant.update({
      where: { userId },
      data: {
        fullName,
        phone,
        department,
        about
      }
    });
    
    res.json(assistant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update assistant profile' });
  }
};

module.exports = {
  getAssistantProfile,
  updateAssistantProfile
};
