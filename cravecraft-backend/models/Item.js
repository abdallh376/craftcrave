const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  description: { type: String },
  stock: { type: Number, default: 20 },      // 👈 القيمة الافتراضية للمخزون
  quantity: { type: Number, default: 20 },   // 👈 احتياطياً لو بتستخدم المسميين
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);