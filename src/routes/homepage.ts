import express from 'express';
import HomepageSection from '../models/HomepageSection.ts';

const router = express.Router();

// Get homepage configuration
router.get('/', async (_req, res) => {
  try {
    const sections = await HomepageSection.find().sort({ order: 1 });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching homepage configuration', error: err });
  }
});

// Replace homepage configuration
router.put('/', async (req, res) => {
  try {
    const { sections } = req.body;

    if (!Array.isArray(sections)) {
      return res.status(400).json({ message: 'Payload invalid: sections must be an array' });
    }

    await HomepageSection.deleteMany({});

    const sanitizedSections = sections.map((section: any) => ({
      type: section.type,
      title: section.title,
      productIds: section.productIds || [],
      categoryIds: section.categoryIds || [],
      autoGenerate: section.autoGenerate ?? true,
      maxItems: section.maxItems ?? 6,
      order: section.order ?? 0,
      active: section.active ?? true,
    }));

    const createdSections = await HomepageSection.insertMany(sanitizedSections);
    res.json(createdSections);
  } catch (err) {
    res.status(400).json({ message: 'Error saving homepage configuration', error: err });
  }
});

export default router;
