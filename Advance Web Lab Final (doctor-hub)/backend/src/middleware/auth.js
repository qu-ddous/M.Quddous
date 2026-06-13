const supabase = require('../config/supabase');
const prisma = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Get user from Supabase using the token
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
    
    if (error || !supabaseUser) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }
    
    // Lookup user in local database using the ID returned by Supabase Auth (UUID)
    let user = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
      select: { id: true, email: true, role: true }
    });
    
    // Fallback: look up by email in case records exist but IDs are different
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: supabaseUser.email },
        select: { id: true, email: true, role: true }
      });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'User not registered in local database' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    next();
  };
};

module.exports = { auth, authorize };
