import express from 'express';
import Product from '../models/Product.ts';
import Order from '../models/Order.ts';
import User from '../models/User.ts';

const router = express.Router();

const statusMap: Record<string, string> = {
  pending: 'new',
  new: 'new',
  processing: 'processing',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

router.get('/', async (_req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);

    const [totalOrders, totalProducts, activeUsers, recentOrdersDocs, lowStockDocs] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ isActive: true }),
      Order.find().sort({ createdAt: -1 }).limit(50).populate('userId'),
      Product.find({ stock: { $lte: 5 }, active: true }).sort({ stock: 1 }).limit(10),
    ]);

    const ordersLast30 = recentOrdersDocs.filter(o => o.createdAt >= thirtyDaysAgo);
    const monthlySales = ordersLast30.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Sales data for last 7 days
    const salesDataMap: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      salesDataMap[key] = 0;
    }

    recentOrdersDocs.forEach(order => {
      const key = order.createdAt.toISOString().slice(0, 10);
      if (key in salesDataMap) {
        salesDataMap[key] += order.totalPrice || 0;
      }
    });

    const salesData = Object.entries(salesDataMap)
      .sort((a, b) => (a[0] > b[0] ? 1 : -1))
      .map(([date, amount]) => ({ date, amount }));

    const recentOrders = recentOrdersDocs.slice(0, 5).map(order => ({
      id: order._id.toString(),
      customerName: (order as any).userId?.name || 'Client',
      customerEmail: (order as any).userId?.email || '',
      total: order.totalPrice,
      status: statusMap[order.status] || 'processing',
      createdAt: order.createdAt,
    }));

    const lowStockProducts = lowStockDocs.map(product => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: undefined,
      categoryId: product.categoryId?.toString?.() || '',
      specifications: [],
      images: (product.images || []).map((url: string, idx: number) => ({
        id: `${product._id.toString()}-${idx}`,
        url,
        alt: product.name,
        order: idx,
      })),
      stock: product.stock,
      active: product.active,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    res.json({
      totalOrders,
      monthlySales,
      totalProducts,
      activeUsers,
      salesData,
      recentOrders,
      lowStockProducts,
    });
  } catch (err) {
    console.error('Error building dashboard stats', err);
    res.status(500).json({ message: 'Error fetching dashboard stats', error: err });
  }
});

export default router;
