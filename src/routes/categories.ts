import express from 'express';
import Category from '../models/Category.ts';
import Product from '../models/Product.ts';

const router = express.Router();

// GET toate categoriile (doar parent categories - root level)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ parentId: null });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// GET subcategoriile unei categorii
router.get('/:id/children', async (req, res) => {
  try {
    const subcategories = await Category.find({ parentId: req.params.id });
    res.json(subcategories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subcategories' });
  }
});

// GET categorie după ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching category' });
  }
});

// POST categorie nouă (admin)
router.post('/', async (req, res) => {
  try {
    console.log('Creating category with data:', req.body);
    const category = new Category(req.body);
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (err: any) {
    console.error('Error creating category:', err);
    res.status(400).json({ 
      message: 'Error creating category', 
      error: err.message,
      details: err.errors 
    });
  }
});

// PUT update categorie (admin)
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: 'Error updating category', error: err });
  }
});

// DELETE categorie (admin) — cascade without transaction (works on standalone MongoDB)
router.delete('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;

    // 1) Ensure category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // 2) Find direct children to clean product refs
    const children = await Category.find({ parentId: categoryId }).select('_id');
    const childIds = children.map((c) => c._id);

    // 3) Delete children then parent
    await Category.deleteMany({ parentId: categoryId });
    await Category.findByIdAndDelete(categoryId);

    // 4) Clean product references (both parent and children that might be referenced)
    await Product.updateMany(
      { categoryId: categoryId },
      { $set: { categoryId: null } }
    );
    await Product.updateMany(
      { subcategoryId: categoryId },
      { $set: { subcategoryId: null } }
    );
    if (childIds.length > 0) {
      await Product.updateMany(
        { subcategoryId: { $in: childIds } },
        { $set: { subcategoryId: null } }
      );
      await Product.updateMany(
        { categoryId: { $in: childIds } },
        { $set: { categoryId: null } }
      );
    }

    res.json({ message: 'Category deleted. Subcategories removed and product references cleaned.' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ message: 'Error deleting category', error: (err as any)?.message || err });
  }
});

export default router;
