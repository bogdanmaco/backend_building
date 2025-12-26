import express from 'express';
import User from '../models/User.ts';
import Order from '../models/Order.ts';

const router = express.Router();

// Get user's cart
router.get('/cart', async (req, res) => {
  try {
    const user = await User.findById((req as any).user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }
    res.json({ cart: user.cart || [] });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ message: 'Eroare la încărcarea coșului' });
  }
});

// Update user's cart
router.put('/cart', async (req, res) => {
  try {
    const { cart } = req.body;
    const user = await User.findByIdAndUpdate(
      (req as any).user.userId,
      { cart },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }
    res.json({ cart: user.cart });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Eroare la salvarea coșului' });
  }
});

// Add item to cart (operație individuală)
router.post('/cart/items', async (req, res) => {
  try {
    const { id, name, price, image } = req.body;
    const user = await User.findById((req as any).user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }

    const existingItem = (user.cart as any)?.find((item: any) => item.id === id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      if (!user.cart) {
        (user.cart as any) = [];
      }
      (user.cart as any).push({ id, name, price, quantity: 1, image });
    }

    await user.save();
    res.json({ cart: user.cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Eroare la adăugarea în coș' });
  }
});

// Remove item from cart (operație individuală)
router.delete('/cart/items/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById((req as any).user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }

    (user.cart as any) = ((user.cart as any) || []).filter((item: any) => item.id !== productId);
    await user.save();
    res.json({ cart: user.cart });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Eroare la ștergerea din coș' });
  }
});

// Update item quantity
router.patch('/cart/items/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const user = await User.findById((req as any).user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }

    const item = (user.cart as any)?.find((item: any) => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        (user.cart as any) = ((user.cart as any) || []).filter((item: any) => item.id !== productId);
      } else {
        item.quantity = quantity;
      }
      await user.save();
    }

    res.json({ cart: user.cart });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Eroare la actualizarea coșului' });
  }
});

// Get user's favorites
router.get('/favorites', async (req, res) => {
  try {
    const user = await User.findById((req as any).user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }
    res.json({ favorites: user.favorites || [] });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ message: 'Eroare la încărcarea favoritelor' });
  }
});

// Update user's favorites
router.put('/favorites', async (req, res) => {
  try {
    const { favorites } = req.body;
    const user = await User.findByIdAndUpdate(
      (req as any).user.userId,
      { favorites },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }
    res.json({ favorites: user.favorites });
  } catch (error) {
    console.error('Error updating favorites:', error);
    res.status(500).json({ message: 'Eroare la salvarea favoritelor' });
  }
});

// Add to favorites (operație individuală)
router.post('/favorites/items/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById((req as any).user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }

    if (!user.favorites) user.favorites = [];
    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
    }

    res.json({ favorites: user.favorites });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Eroare la adăugarea la favorite' });
  }
});

// Remove from favorites (operație individuală)
router.delete('/favorites/items/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById((req as any).user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }

    user.favorites = user.favorites?.filter((id: string) => id !== productId) || [];
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ message: 'Eroare la ștergerea din favorite' });
  }
});

// Create order for current user
router.post('/orders', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { products, totalPrice, shippingAddress, deliveryMethod, paymentMethod, comment, customer } = req.body;

    const effectiveDeliveryMethod = deliveryMethod && (deliveryMethod === 'courier' || deliveryMethod === 'pickup')
      ? deliveryMethod
      : (paymentMethod === 'courier' || paymentMethod === 'pickup' ? paymentMethod : 'courier');

    const order = new Order({
      userId,
      products,
      totalPrice,
      shippingAddress,
      deliveryMethod: effectiveDeliveryMethod,
      paymentMethod,
      isPaid: false,
      status: 'pending',
      customer,
      comment,
    } as any);

    const saved = await order.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ message: 'Eroare la crearea comenzii', error });
  }
});

// Get orders for current user
router.get('/orders', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    console.error('Error loading orders:', error);
    res.status(500).json({ message: 'Eroare la încărcarea comenzilor' });
  }
});

export default router;
// Stats for current user: orders count, favorites count, total spent
router.get('/stats', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }

    const orders = await Order.find({ userId });
    const ordersCount = orders.length;
    const totalSpent = orders.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0);
    const favoritesCount = (user.favorites || []).length;

    res.json({ ordersCount, favoritesCount, totalSpent });
  } catch (error) {
    console.error('Error loading stats:', error);
    res.status(500).json({ message: 'Eroare la încărcarea statisticilor' });
  }
});
