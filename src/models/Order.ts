import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: String,
        price: Number,
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    deliveryMethod: {
      type: String,
      enum: ['courier', 'pickup'],
      default: 'courier',
    },
    paymentMethod: {
      type: String,
      default: 'card',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    customer: {
      firstName: String,
      lastName: String,
      phone: String,
      email: String,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
