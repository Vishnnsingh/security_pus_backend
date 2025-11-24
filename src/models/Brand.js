import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    categories: [
      {
        type: String,
        trim: true
      }
    ],
    subcategories: [
      {
        type: String,
        trim: true
      }
    ],
    logo: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

brandSchema.index({ name: 'text' });

const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);

export default Brand;


