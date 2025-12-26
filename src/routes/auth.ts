import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.ts';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email și parolă sunt necesare' });
    }

    // Elimină spațiile și convertește la minuscule
    const normalizedEmail = String(email).toLowerCase().trim();
    const trimmedPassword = String(password).trim();
    
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Date de autentificare invalide' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Acces interzis - Doar administratori' });
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
      {
        userId: user._id,
        role: user.role,
        email: user.email,
      },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Eroare la autentificare', error: err });
  }
});

export default router;
