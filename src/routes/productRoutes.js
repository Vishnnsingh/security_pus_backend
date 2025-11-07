import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

const router = express.Router();

const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

router.post('/', async (req, res) => {
  try {
    const payload = req.body || {};

    if (!payload.name || typeof payload.name !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    const productData = { ...payload };

    if (Array.isArray(productData.features)) {
      productData.features = productData.features
        .map((feature) => (typeof feature === 'string' ? feature.trim() : ''))
        .filter(Boolean);
    } else if (typeof productData.features === 'string') {
      productData.features = productData.features
        .split('\n')
        .map((feature) => feature.trim())
        .filter(Boolean);
    }

    const price = parseNumber(productData.price);
    if (price !== undefined) {
      productData.price = price;
    }

    const salePrice = parseNumber(productData.salePrice);
    if (salePrice !== undefined) {
      productData.salePrice = salePrice;
    }

    const stock = parseNumber(productData.stock);
    if (stock !== undefined) {
      productData.stock = stock;
    }

    if (Array.isArray(productData.tags)) {
      productData.tags = productData.tags.filter(Boolean);
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Product create error:', error);

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map((err) => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      category,
      sort = '-createdAt'
    } = req.query;

    const filters = {};

    if (status) {
      filters.status = status;
    }

    if (category) {
      filters.category = category;
    }

    if (search) {
      filters.$text = { $search: search };
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNumber - 1) * limitNumber;

    const [items, total] = await Promise.all([
      Product.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limitNumber),
      Product.countDocuments(filters)
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          pages: Math.ceil(total / limitNumber)
        }
      }
    });
  } catch (error) {
    console.error('Product list error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product id'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Product detail error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product id'
      });
    }

    const payload = req.body || {};
    const updates = { ...payload };

    if (Array.isArray(updates.features)) {
      updates.features = updates.features
        .map((feature) => (typeof feature === 'string' ? feature.trim() : ''))
        .filter(Boolean);
    } else if (typeof updates.features === 'string') {
      updates.features = updates.features
        .split('\n')
        .map((feature) => feature.trim())
        .filter(Boolean);
    }

    const price = parseNumber(updates.price);
    if (price !== undefined) {
      updates.price = price;
    }

    const salePrice = parseNumber(updates.salePrice);
    if (salePrice !== undefined) {
      updates.salePrice = salePrice;
    }

    const stock = parseNumber(updates.stock);
    if (stock !== undefined) {
      updates.stock = stock;
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Product update error:', error);

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map((err) => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product id'
      });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Product delete error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

