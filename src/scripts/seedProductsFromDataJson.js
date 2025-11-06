import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Product from '../models/Product.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolveDataPath = () => {
  const candidatePaths = [
    path.resolve(__dirname, '../../../Security-Plus-Website/src/data.json'),
    path.resolve(__dirname, '../../Security-Plus-Website/src/data.json'),
    path.resolve(__dirname, '../public/data.json'),
    path.resolve(__dirname, '../../src/data.json')
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error('Unable to locate data.json. Please ensure the frontend project is available.');
};

const normalizeProduct = (product, categoryKey, categoryName, index) => {
  const legacyId = product.id || product.slug || `${categoryKey}-${index}`;
  const slugBase = (product.slug || product.id || product.name || legacyId || '').toString().toLowerCase();
  const slug = slugBase ? slugBase.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : undefined;

  return {
    name: product.name,
    brand: product.brand || '',
    price: Number(product.price) || 0,
    salePrice: Number(product.salePrice) || undefined,
    category: categoryKey,
    categoryName,
    subcategory: product.subcategory || product.subCategory || '',
    description: product.description || '',
    features: Array.isArray(product.features) ? product.features : [],
    image_links: Array.isArray(product.image_links) ? product.image_links.filter(Boolean) : [],
    colors: Array.isArray(product.colors) ? product.colors : [],
    available_sizes: Array.isArray(product.available_sizes) ? product.available_sizes : (Array.isArray(product.sizes) ? product.sizes : []),
    rating: Number(product.rating) || 0,
    stock: Number(product.stock ?? 50) || 50,
    isBestseller: Boolean(product.isBestseller),
    source: 'seed',
    legacyId,
    slug,
    metadata: {
      importedAt: new Date(),
      originalCategoryName: categoryName
    }
  };
};

async function seedProducts() {
  try {
    await connectDB();
    const dataPath = resolveDataPath();
    console.log(`📄 Loading data from ${dataPath}`);

    const rawData = fs.readFileSync(dataPath, 'utf8');
    const jsonData = JSON.parse(rawData);

    if (!jsonData?.categories || typeof jsonData.categories !== 'object') {
      throw new Error('Invalid data.json format: categories object not found');
    }

    const products = [];

    Object.entries(jsonData.categories).forEach(([categoryKey, categoryValue]) => {
      const categoryName = categoryValue?.name || categoryKey;
      const items = Array.isArray(categoryValue?.products) ? categoryValue.products : [];

      items.forEach((product, index) => {
        products.push(normalizeProduct(product, categoryKey, categoryName, index));
      });
    });

    if (products.length === 0) {
      console.log('⚠️  No products found to import.');
      return;
    }

    console.log(`📦 Preparing to sync ${products.length} products...`);

    const legacyIds = products.map(product => product.legacyId).filter(Boolean);

    const bulkOperations = products.map(product => ({
      updateOne: {
        filter: { legacyId: product.legacyId },
        update: { $set: product },
        upsert: true
      }
    }));

    const result = await Product.bulkWrite(bulkOperations, { ordered: false });

    if (legacyIds.length > 0) {
      await Product.deleteMany({
        source: 'seed',
        legacyId: { $nin: legacyIds }
      });
    }

    const count = await Product.countDocuments();

    console.log('🎉 Seed completed successfully!');
    console.log(`🆕 Upserts: ${result.upsertedCount}`);
    console.log(`🔁 Modified: ${result.modifiedCount}`);
    console.log(`📊 Total products now in collection: ${count}`);
  } catch (error) {
    console.error('❌ Failed to seed products:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

seedProducts();

