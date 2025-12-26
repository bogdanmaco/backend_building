import express from 'express';
import User from '../models/User.ts';
import Order from '../models/Order.ts';

const router = express.Router();

// GET /api/users - Get all users with their order statistics
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Get order statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ userId: user._id });
        const ordersCount = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '-',
          role: user.role,
          isActive: user.isActive,
          ordersCount,
          totalSpent,
          createdAt: user.createdAt,
          lastLogin: user.updatedAt, // Using updatedAt as lastLogin proxy
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Eroare la încărcarea utilizatorilor' });
  }
});

// GET /api/users/:id - Get user details
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }

    const orders = await Order.find({ userId: user._id });
    const ordersCount = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '-',
      address: user.address,
      city: user.city,
      postalCode: user.postalCode,
      role: user.role,
      isActive: user.isActive,
      ordersCount,
      totalSpent,
      createdAt: user.createdAt,
      lastLogin: user.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Eroare la încărcarea utilizatorului' });
  }
});

export default router;
