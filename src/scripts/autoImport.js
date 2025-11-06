import connectDB from '../config/database.js';
import { AutoDataFetcher } from '../utils/autoDataFetcher.js';
import mongoose from 'mongoose';

/**
 * Automatic Import Script
 * Automatically finds and imports data.json from Security Plus frontend
 */

async function autoImport() {
  try {
    console.log('🚀 Security Plus Auto Data Importer');
    console.log('=====================================');
    
    // Connect to MongoDB
    await connectDB();
    
    // Create auto fetcher
    const fetcher = new AutoDataFetcher();
    
    // Get collection name from command line or use default
    const collectionName = process.argv[2] || 'security-plus-data';
    
    console.log(`📊 Target Collection: ${collectionName}`);
    console.log('');
    
    // Auto-import data
    const result = await fetcher.autoImportToMongo(collectionName);
    
    if (result.success) {
      console.log('');
      console.log('🎉 IMPORT COMPLETED SUCCESSFULLY!');
      console.log('================================');
      console.log(`📊 Collection: ${result.collectionName}`);
      console.log(`📈 Documents: ${result.documentCount}`);
      console.log(`🗄️ Database: security-plus-admin`);
      console.log('');
      console.log('🔗 View in MongoDB Compass:');
      console.log('   mongodb://localhost:27017/security-plus-admin');
      console.log('');
      console.log('📱 Your data is now ready in MongoDB!');
    }
    
  } catch (error) {
    console.error('❌ Auto-import failed:', error.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   1. Make sure MongoDB is running');
    console.log('   2. Check if data.json exists in frontend');
    console.log('   3. Verify file permissions');
    console.log('   4. Check JSON file format');
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run auto-import
autoImport();
