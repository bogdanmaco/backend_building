import mongoose from 'mongoose';

const homepageSectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['new_products', 'discounts', 'popular', 'popular_categories'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    productIds: {
      type: [String],
      default: [],
    },
    categoryIds: {
      type: [String],
      default: [],
    },
    autoGenerate: {
      type: Boolean,
      default: true,
    },
    maxItems: {
      type: Number,
      default: 6,
    },
    order: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('HomepageSection', homepageSectionSchema);
