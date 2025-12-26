import express from 'express';
import Banner from '../models/Banner.ts';

const router = express.Router();

// GET toate bannerele
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ position: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching banners' });
  }
});

// GET banner după ID
router.get('/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching banner' });
  }
});

// POST banner nou (admin)
router.post('/', async (req, res) => {
  try {
    const banner = new Banner(req.body);
    const savedBanner = await banner.save();
    res.status(201).json(savedBanner);
  } catch (err) {
    res.status(400).json({ message: 'Error creating banner', error: err });
  }
});

// PUT update banner (admin)
router.put('/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json(banner);
  } catch (err) {
    res.status(400).json({ message: 'Error updating banner', error: err });
  }
});

// DELETE banner (admin)
router.delete('/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting banner', error: err });
  }
});

export default router;
