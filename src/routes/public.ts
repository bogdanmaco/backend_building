import express from 'express';
import Product from '../models/Product.ts';
import Category from '../models/Category.ts';
import Banner from '../models/Banner.ts';
import HomepageSection from '../models/HomepageSection.ts';
import Order from '../models/Order.ts';

const router = express.Router();

// GET produse publice (active)
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({ active: true });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// GET produs după ID (public)
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.active) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// GET categorii publice
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// GET bannere active
router.get('/banners', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ position: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching banners' });
  }
});

// GET configurare homepage publică
router.get('/homepage', async (req, res) => {
  try {
    const sections = await HomepageSection.find({ active: true }).sort({ order: 1 });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching homepage configuration' });
  }
});

// POST comandă publică (guest). Dacă există bearer token valid pe gateway-ul superior, userId poate fi setat acolo; aici acceptăm fără user.
router.post('/orders', async (req, res) => {
  try {
    const { products, totalPrice, shippingAddress, deliveryMethod, paymentMethod, comment, customer, userId } = req.body;

    // Backward compatibility: if client still sends paymentMethod as delivery choice
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
    console.error('Error creating public order:', error);
    res.status(400).json({ message: 'Eroare la crearea comenzii', error });
  }
});

export default router;
