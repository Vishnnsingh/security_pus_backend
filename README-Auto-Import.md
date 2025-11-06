# 🚀 Security Plus Auto Data Importer

**Automatically fetch data.json from your Security Plus frontend and convert it to MongoDB!**

## 🎯 What This Does

✅ **Automatically finds** your `data.json` file from Security Plus frontend  
✅ **Converts to MongoDB** format with proper ObjectIds  
✅ **Imports to MongoDB** and displays in MongoDB Compass  
✅ **Auto-sync** - watches for changes and updates automatically  
✅ **Multiple methods** - CLI, API, and continuous sync  

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Environment
```bash
cp env.example .env
```

Edit `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/security-plus-admin
PORT=5000
```

### 3. Make sure MongoDB is running
```bash
# Start MongoDB (if using local)
mongod

# Or use MongoDB Atlas (cloud)
```

## 📊 Usage Methods

### Method 1: One-time Auto Import (Easiest)
```bash
# Automatically finds and imports data.json from frontend
npm run auto-import

# With custom collection name
npm run auto-import my-collection-name
```

### Method 2: Continuous Auto Sync (Recommended)
```bash
# Watches frontend data.json and auto-syncs changes
npm run watch-sync

# With custom collection name  
npm run watch-sync my-collection-name
```

### Method 3: API Endpoints
```bash
# Start the server
npm run dev

# Then use these endpoints:
```

**Auto Import via API:**
```bash
curl -X POST http://localhost:5000/api/auto-import/import \
  -H "Content-Type: application/json" \
  -d '{"collectionName": "security-plus-data"}'
```

**Check Status:**
```bash
curl http://localhost:5000/api/auto-import/status
```

**View Collections:**
```bash
curl http://localhost:5000/api/auto-import/collections
```

**View Data:**
```bash
curl http://localhost:5000/api/auto-import/data/security-plus-data
```

## 🔍 How It Works

### 1. **Auto-Discovery**
The system automatically searches for `data.json` in these locations:
- `../security-plus-frontend/data.json`
- `../../security-plus-frontend/data.json` 
- `../../../security-plus-frontend/data.json`
- `./frontend/data.json`
- `./public/data.json`
- `./data.json`

### 2. **Smart Schema Detection**
- Automatically creates MongoDB schema from your JSON structure
- Handles nested objects, arrays, and different data types
- Converts string IDs to MongoDB ObjectIds
- Adds timestamps (createdAt, updatedAt)

### 3. **MongoDB Integration**
- Imports data to MongoDB with proper formatting
- Data appears in MongoDB Compass ready to view
- Handles large datasets with batch processing
- Error handling and validation

## 📁 Expected Frontend Structure

Your Security Plus frontend should have a `data.json` file like:

```json
{
  "users": [
    {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "profile": {
        "age": 30,
        "city": "New York"
      }
    }
  ],
  "products": [
    {
      "id": "prod456",
      "name": "Security Plus Pro",
      "price": 99.99
    }
  ]
}
```

## 🎯 What Happens After Import

1. **Data is converted** to MongoDB format with ObjectIds
2. **Schema is created** automatically from your data structure  
3. **Data is imported** to MongoDB database
4. **View in MongoDB Compass** - your data is ready!

## 📊 MongoDB Compass View

After import, you'll see:
- ✅ Proper `_id` fields (ObjectIds)
- ✅ `createdAt` and `updatedAt` timestamps
- ✅ Nested objects preserved
- ✅ All original data structure maintained
- ✅ Ready for queries and analysis

## 🔄 Auto Sync Features

When using `npm run watch-sync`:
- 👀 **Watches** your frontend `data.json` file
- 🔄 **Auto-updates** MongoDB when you change the file
- 📊 **Real-time sync** - no manual intervention needed
- ⚡ **Instant updates** - changes appear in MongoDB Compass immediately

## 🛠️ Troubleshooting

### Common Issues:

1. **"data.json not found"**
   - Check if `data.json` exists in your frontend
   - Verify the file path is correct
   - Make sure the file is readable

2. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check network connectivity

3. **JSON Parse Error**
   - Ensure `data.json` is valid JSON
   - Check file encoding (should be UTF-8)
   - Validate JSON syntax

### Debug Commands:
```bash
# Check if data.json exists
ls -la ../security-plus-frontend/data.json

# Test MongoDB connection
mongosh mongodb://localhost:27017/security-plus-admin

# Check server logs
npm run dev
```

## 📈 Performance Tips

- Use `watch-sync` for development (automatic updates)
- Use `auto-import` for production (one-time import)
- Large files are processed in batches automatically
- Monitor MongoDB memory usage for very large datasets

## 🔒 Security Notes

- Validates JSON files before processing
- Uses environment variables for sensitive data
- Implements proper error handling
- Sanitizes data during conversion

## 📞 Support

For issues:
1. Check console logs for detailed error messages
2. Verify your `data.json` file format
3. Ensure MongoDB is accessible
4. Check file permissions and paths

## 🎉 Success!

Once running, you'll see:
```
✅ Successfully imported 150 documents to MongoDB!
🗄️ Collection: security-plus-data
🔗 View in MongoDB Compass: mongodb://localhost:27017/security-plus-admin
📱 Your data is now ready in MongoDB!
```

Your Security Plus frontend data is now automatically converted and ready in MongoDB! 🚀
