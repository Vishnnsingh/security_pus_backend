import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

/**
 * Automatic Data Fetcher for Security Plus Frontend
 * Fetches data.json from frontend and converts to MongoDB
 */
export class AutoDataFetcher {
  constructor() {
    this.frontendPaths = [
      '../security-plus-frontend/data.json',
      '../../security-plus-frontend/data.json',
      '../../../security-plus-frontend/data.json',
      './frontend/data.json',
      './public/data.json',
      './data.json'
    ];
  }

  /**
   * Find and read data.json from frontend
   */
  async findFrontendData() {
    console.log('🔍 Searching for data.json in frontend...');
    
    for (const frontendPath of this.frontendPaths) {
      try {
        const fullPath = path.resolve(frontendPath);
        if (fs.existsSync(fullPath)) {
          console.log(`✅ Found data.json at: ${fullPath}`);
          const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          return { data, path: fullPath };
        }
      } catch (error) {
        console.log(`❌ Not found at: ${frontendPath}`);
      }
    }
    
    throw new Error('❌ data.json not found in any frontend location');
  }

  /**
   * Auto-detect data structure and create schema
   */
  createAutoSchema(sampleData) {
    const schemaDefinition = {};
    
    function analyzeData(obj, prefix = '') {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'string') {
          // Check if it's a date
          if (!isNaN(Date.parse(value)) && value.length > 10) {
            schemaDefinition[fullKey] = Date;
          } else {
            schemaDefinition[fullKey] = String;
          }
        } else if (typeof value === 'number') {
          schemaDefinition[fullKey] = Number;
        } else if (typeof value === 'boolean') {
          schemaDefinition[fullKey] = Boolean;
        } else if (Array.isArray(value)) {
          if (value.length > 0 && typeof value[0] === 'object') {
            schemaDefinition[fullKey] = [Object];
          } else {
            schemaDefinition[fullKey] = [String];
          }
        } else if (typeof value === 'object' && value !== null) {
          analyzeData(value, fullKey);
        }
      }
    }

    analyzeData(sampleData);
    
    return new mongoose.Schema(schemaDefinition, {
      timestamps: true,
      strict: false
    });
  }

  /**
   * Convert frontend data to MongoDB format
   */
  convertToMongoFormat(data) {
    const dataArray = Array.isArray(data) ? data : [data];
    
    return dataArray.map((item, index) => {
      const mongoDoc = {
        ...item,
        _id: item._id || item.id || new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Remove original id if it exists
      if (mongoDoc.id) {
        delete mongoDoc.id;
      }

      // Convert nested IDs to ObjectIds
      this.convertNestedIds(mongoDoc);
      
      return mongoDoc;
    });
  }

  /**
   * Convert nested string IDs to ObjectIds
   */
  convertNestedIds(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key === 'id' && typeof obj[key] === 'string' && obj[key].length === 24) {
          obj._id = new mongoose.Types.ObjectId(obj[key]);
          delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          this.convertNestedIds(obj[key]);
        }
      }
    }
  }

  /**
   * Auto-import data to MongoDB
   */
  async autoImportToMongo(collectionName = 'security-plus-data') {
    try {
      console.log('🚀 Starting automatic data import...');
      
      // Find and read frontend data
      const { data, path } = await this.findFrontendData();
      console.log(`📁 Data loaded from: ${path}`);
      
      // Create schema from data
      const dataArray = Array.isArray(data) ? data : [data];
      const schema = this.createAutoSchema(dataArray[0]);
      
      // Create model
      const model = mongoose.model(collectionName, schema);
      
      // Convert data to MongoDB format
      const mongoData = this.convertToMongoFormat(data);
      console.log(`📊 Converting ${mongoData.length} documents...`);
      
      // Clear existing data
      await model.collection.drop().catch(() => {
        console.log('📝 Creating new collection...');
      });
      
      // Insert data in batches
      const batchSize = 100;
      let insertedCount = 0;
      
      for (let i = 0; i < mongoData.length; i += batchSize) {
        const batch = mongoData.slice(i, i + batchSize);
        const result = await model.insertMany(batch);
        insertedCount += result.length;
        console.log(`📈 Inserted batch ${Math.floor(i / batchSize) + 1}: ${result.length} documents`);
      }
      
      console.log(`✅ Successfully imported ${insertedCount} documents to MongoDB!`);
      console.log(`🗄️ Collection: ${collectionName}`);
      console.log(`🔗 View in MongoDB Compass: mongodb://localhost:27017/security-plus-admin`);
      
      return {
        success: true,
        collectionName,
        documentCount: insertedCount,
        schema: schema.obj
      };
      
    } catch (error) {
      console.error('❌ Auto-import failed:', error.message);
      throw error;
    }
  }

  /**
   * Watch for changes in frontend data.json
   */
  async startWatching(collectionName = 'security-plus-data') {
    console.log('👀 Starting file watcher for automatic updates...');
    
    const { path } = await this.findFrontendData();
    
    fs.watchFile(path, { interval: 2000 }, async (curr, prev) => {
      if (curr.mtime > prev.mtime) {
        console.log('🔄 Frontend data.json updated, re-importing...');
        try {
          await this.autoImportToMongo(collectionName);
          console.log('✅ Data updated successfully!');
        } catch (error) {
          console.error('❌ Update failed:', error.message);
        }
      }
    });
    
    console.log(`👀 Watching ${path} for changes...`);
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(collectionName = 'security-plus-data') {
    try {
      const model = mongoose.model(collectionName);
      const count = await model.countDocuments();
      const sample = await model.findOne();
      
      return {
        collectionName,
        documentCount: count,
        sampleDocument: sample,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('❌ Error getting stats:', error.message);
      throw error;
    }
  }
}
