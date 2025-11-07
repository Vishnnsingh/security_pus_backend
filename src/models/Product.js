import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    publicId: { type: String, trim: true },
    alt: { type: String, trim: true }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    sku: {
      type: String,
      trim: true,
      index: true
    },
    brand: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      trim: true
    },
    subCategory: {
      type: String,
      trim: true
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    price: {
      type: Number,
      min: 0
    },
    salePrice: {
      type: Number,
      min: 0
    },
    stock: {
      type: Number,
      min: 0,
      default: 0
    },
    status: {
      type: String,
      trim: true,
      enum: ['draft', 'active', 'inactive'],
      default: 'active'
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    features: [
      {
        type: String,
        trim: true
      }
    ],
    thumbnail: imageSchema,
    images: [imageSchema],
    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    strict: false
  }
);

productSchema.index(
  {
    name: 'text',
    description: 'text',
    sku: 'text'
  },
  {
    weights: {
      name: 5,
      sku: 3,
      description: 1
    },
    name: 'product_text_index'
  }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;

