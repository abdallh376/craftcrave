const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userDetails: {
    fullName: { type: String, required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  items: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    name: String,
    price: Number,
    orderQuantity: Number
  }],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'failed'], default: 'unpaid' },
  stripeSessionId: { type: String },
  stripePaymentIntentId: { type: String },
  status: {
    type: String,
    enum: [
      'opened', 'closed',
      'Pending', 'Preparing', 'Delivered', 'Cancelled',
      'pending', 'preparing', 'delivered', 'cancelled', 'out-for-delivery'
    ],
    default: 'opened'
  },
  notes: [{
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
