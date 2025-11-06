import connectDB from '../config/database.js';
import { AutoDataFetcher } from '../utils/autoDataFetcher.js';
import mongoose from 'mongoose';

/**
 * Watch and Sync Script
 * Continuously watches frontend data.json and syncs to MongoDB
 */

async function startWatching() {
  try {
    console.log('👀 Security Plus Auto Sync Watcher');
    console.log('===================================');
    
    // Connect to MongoDB
    await connectDB();
    
    // Create auto fetcher
    const fetcher = new AutoDataFetcher();
    
    // Get collection name from command line or use default
    const collectionName = process.argv[2] || 'security-plus-data';
    
    console.log(`📊 Target Collection: ${collectionName}`);
    console.log('');
    
    // Initial import
    console.log('🔄 Performing initial import...');
    await fetcher.autoImportToMongo(collectionName);
    
    // Start watching for changes
    await fetcher.startWatching(collectionName);
    
    console.log('');
    console.log('✅ Auto-sync is now active!');
    console.log('🔄 Any changes to frontend data.json will be automatically synced');
    console.log('⏹️  Press Ctrl+C to stop watching');
    console.log('');
    
    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('');
      console.log('🛑 Stopping auto-sync...');
      await mongoose.connection.close();
      console.log('✅ Auto-sync stopped');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Auto-sync failed:', error.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   1. Make sure MongoDB is running');
    console.log('   2. Check if data.json exists in frontend');
    console.log('   3. Verify file permissions');
    process.exit(1);
  }
}

// Start watching
startWatching();
