import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    icon: {
      type: String,
      default: 'Package',
    },
    slug: {
      type: String,
      required: false,
      sparse: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
