import express from 'express';
import Product from '../models/Product.js';
import Brand from '../models/Brand.js';

const router = express.Router();

const buildRegex = (value = '') => {
  return new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
};

router.post('/', async (req, res) => {
  try {
    const { name, description, categories = [], subcategories = [], logo, website, isActive = true } = req.body || {};

    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Brand name is required'
      });
    }

    const normalizedName = name.trim();

    const existing = await Brand.findOne({ name: buildRegex(normalizedName) });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Brand with this name already exists'
      });
    }

    const brand = await Brand.create({
      name: normalizedName,
      description,
      categories,
      subcategories,
      logo,
      website,
      isActive
    });

    res.status(201).json({
      success: true,
      data: brand,
      message: 'Brand created successfully'
    });
  } catch (error) {
    console.error('Brand create error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create brand',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, subcategory } = req.query || {};

    const filters = { };

    if (category && category !== 'all') {
      filters.categories = buildRegex(category.trim());
    }

    if (subcategory && subcategory !== 'all') {
      filters.subcategories = subcategory;
    }

    let brands = await Brand.find(filters).sort({ name: 1 }).lean();

    if (!brands.length) {
      // fallback to historic data from products
      const productFilters = {};

      if (category && category !== 'all') {
        productFilters.category = buildRegex(category.trim());
      }

      if (subcategory && subcategory !== 'all') {
        productFilters.$or = [
          { subCategory: subcategory },
          { subcategory: subcategory }
        ];
      }

      const products = await Product.find(productFilters)
        .select('brand category subCategory subcategory')
        .lean();

      const brandMap = new Map();

      products.forEach((product) => {
        const brandName = (product.brand || '').trim();
        if (!brandName) return;

        if (!brandMap.has(brandName)) {
          brandMap.set(brandName, {
            name: brandName,
            categories: new Set(),
            subcategories: new Set(),
            productCount: 0
          });
        }

        const entry = brandMap.get(brandName);
        entry.productCount += 1;

        if (product.category) {
            entry.categories.add(product.category);
        }
        if (product.subCategory) {
            entry.subcategories.add(product.subCategory);
        }
        if (product.subcategory) {
            entry.subcategories.add(product.subcategory);
        }
      });

      brands = Array.from(brandMap.values()).map((entry) => ({
        name: entry.name,
        categories: Array.from(entry.categories).sort(),
        subcategories: Array.from(entry.subcategories).sort(),
        productCount: entry.productCount
      })).sort((a, b) => a.name.localeCompare(b.name));
    } else {
      brands = brands.map((brand) => ({
        name: brand.name,
        categories: brand.categories || [],
        subcategories: brand.subcategories || [],
        productCount: brand.productCount ?? 0,
        description: brand.description || '',
        logo: brand.logo || '',
        website: brand.website || '',
        isActive: brand.isActive
      }));
    }

    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    console.error('Brand list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load brands',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

