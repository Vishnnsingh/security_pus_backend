import express from 'express';
import { AutoDataFetcher } from '../utils/autoDataFetcher.js';
import mongoose from 'mongoose';

const router = express.Router();
const fetcher = new AutoDataFetcher();

/**
 * POST /api/auto-import
 * Automatically import data from frontend
 */
router.post('/import', async (req, res) => {
  try {
    const { collectionName = 'security-plus-data' } = req.body;
    
    console.log('🚀 Starting automatic import...');
    const result = await fetcher.autoImportToMongo(collectionName);
    
    res.json({
      success: true,
      message: 'Data imported successfully from frontend',
      data: result
    });
    
  } catch (error) {
    console.error('Auto-import error:', error);
    res.status(500).json({
      success: false,
      message: 'Auto-import failed',
      error: error.message
    });
  }
});

/**
 * GET /api/auto-import/status
 * Get import status and collection info
 */
router.get('/status', async (req, res) => {
  try {
    const { collectionName = 'security-plus-data' } = req.query;
    const stats = await fetcher.getCollectionStats(collectionName);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get status',
      error: error.message
    });
  }
});

/**
 * POST /api/auto-import/sync
 * Start auto-sync (watch for changes)
 */
router.post('/sync', async (req, res) => {
  try {
    const { collectionName = 'security-plus-data' } = req.body;
    
    // Start watching in background
    fetcher.startWatching(collectionName).catch(console.error);
    
    res.json({
      success: true,
      message: 'Auto-sync started',
      collectionName
    });
    
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start sync',
      error: error.message
    });
  }
});

/**
 * GET /api/auto-import/collections
 * List all collections
 */
router.get('/collections', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    const collectionsInfo = await Promise.all(
      collections.map(async (collection) => {
        const count = await db.collection(collection.name).countDocuments();
        return {
          name: collection.name,
          documentCount: count
        };
      })
    );

    res.json({
      success: true,
      collections: collectionsInfo
    });
    
  } catch (error) {
    console.error('Collections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get collections',
      error: error.message
    });
  }
});

/**
 * GET /api/auto-import/data/:collection
 * Get data from specific collection
 */
router.get('/data/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const { limit = 10, skip = 0 } = req.query;
    
    const db = mongoose.connection.db;
    const collectionData = db.collection(collection);
    
    const count = await collectionData.countDocuments();
    const documents = await collectionData
      .find({})
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .toArray();

    res.json({
      success: true,
      collection: {
        name: collection,
        documentCount: count,
        documents: documents
      }
    });
    
  } catch (error) {
    console.error('Data fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch data',
      error: error.message
    });
  }
});

export default router;
