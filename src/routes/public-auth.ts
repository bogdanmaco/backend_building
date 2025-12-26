import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.ts';

const router = express.Router();

// Register - creare cont utilizator public
router.post('/register', async (req, res) => {
  try {
    let { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nume, email și parolă sunt necesare' });
    }

    // Elimină spațiile
    const normalizedEmail = String(email).toLowerCase().trim();
    const trimmedPassword = String(password).trim();
    const trimmedName = String(name).trim();
    
    const existing = await User.findOne({ email: normalizedEmail });
    
    if (existing) {
      return res.status(400).json({ message: 'Email-ul este deja înregistrat' });
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || '',
      role: 'user',
      isActive: true,
    });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT_SECRET nu este configurat' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      secret,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Eroare la înregistrare', error: err });
  }
});

// Login - autentificare utilizator public
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email și parolă sunt necesare' });
    }

    // Elimină spațiile
    const normalizedEmail = String(email).toLowerCase().trim();
    const trimmedPassword = String(password).trim();
    
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Date de autentificare invalide' });
    }

    const isValid = await bcrypt.compare(trimmedPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Date de autentificare invalide' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT_SECRET nu este configurat' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      secret,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      cart: user.cart || [],
      favorites: user.favorites || [],
    });
  } catch (err) {
    res.status(500).json({ message: 'Eroare la autentificare', error: err });
  }
});

export default router;
