import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Import routes
import productRoutes from './routes/products.ts';
import categoryRoutes from './routes/categories.ts';
import orderRoutes from './routes/orders.ts';
import bannerRoutes from './routes/banners.ts';
import homepageRoutes from './routes/homepage.ts';
import dashboardRoutes from './routes/dashboard.ts';
import authRoutes from './routes/auth.ts';
import publicAuthRoutes from './routes/public-auth.ts';
import publicRoutes from './routes/public.ts';
import userRoutes from './routes/users.ts';
import userCartFavoritesRoutes from './routes/user.ts';
import { authMiddleware, adminMiddleware } from './middleware/auth.ts';
import User from './models/User.ts';

dotenv.config();

const app = express();

const ensureAdminUser = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
    const adminPassword = (process.env.ADMIN_PASSWORD || 'admin').trim();
    const adminName = process.env.ADMIN_NAME || 'Administrator';

    const normalizedEmail = adminEmail;
    const existing = await User.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } });
    
    if (!existing) {
      const hashed = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: adminName,
        email: normalizedEmail,
        password: hashed,
        role: 'admin',
        isActive: true,
      });
      console.log('👤 Admin creat automat');
    } else {
      console.log('✅ Admin deja există');
    }
  } catch (error: any) {
    if (error.code === 11000) {
      console.log('ℹ️  Admin deja există (duplicate key)');
    } else {
      console.error('❌ Error creating admin:', error);
    }
  }
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(async () => {
    console.log('✅ MongoDB connected successfully');
    await ensureAdminUser();
    
    // Drop old slug index if it exists
    try {
      const db = mongoose.connection.db;
      await db.collection('categories').dropIndex('slug_1');
      console.log('🗑️  Dropped old slug_1 index');
    } catch (err: any) {
      if (err.code === 27) {
        console.log('ℹ️  No slug_1 index to drop');
      }
    }
  })
  .catch((err) => console.log('❌ MongoDB connection error:', err));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running ✅' });
});

// Rute publice (fără autentificare)
app.use('/api/public/auth', publicAuthRoutes);
app.use('/api/public', publicRoutes);
console.log('✅ Public routes mounted at /api/public');

// Rute user (autentificare necesară dar nu admin)
app.use('/api/user', authMiddleware, userCartFavoritesRoutes);
console.log('✅ User routes mounted at /api/user');

// Rute admin (doar pentru admini)
app.use('/api/auth', authRoutes);
app.use('/api/products', authMiddleware, adminMiddleware, productRoutes);
app.use('/api/categories', authMiddleware, adminMiddleware, categoryRoutes);
app.use('/api/orders', authMiddleware, adminMiddleware, orderRoutes);
app.use('/api/banners', authMiddleware, adminMiddleware, bannerRoutes);
app.use('/api/homepage', authMiddleware, adminMiddleware, homepageRoutes);
app.use('/api/dashboard', authMiddleware, adminMiddleware, dashboardRoutes);
app.use('/api/users', authMiddleware, adminMiddleware, userRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation:`);
  console.log(`   GET  /api/products`);
  console.log(`   POST /api/products`);
  console.log(`   PUT  /api/products/:id`);
  console.log(`   DELETE /api/products/:id`);
  console.log(`   GET  /api/categories`);
  console.log(`   POST /api/categories`);
  console.log(`   GET  /api/orders`);
  console.log(`   POST /api/orders`);
  console.log(`   GET  /api/banners`);
});
