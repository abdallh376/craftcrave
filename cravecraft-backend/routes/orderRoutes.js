const express = require('express');
const router = express.Router();
const { 
  createOrder,
  handleStripeWebhook,
  getCheckoutSession,
  getManagerOrders, 
  closeOrder, 
  updateOrderStatus,
  addOrderNote // تأكد من استيراد دالة إضافة الملاحظات لو موجودة في الكنترولر
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
router.post('/', createOrder);
router.get('/checkout-session/:sessionId', getCheckoutSession);
router.get('/', protect, getManagerOrders);          // الراوت العام للطلبات
router.get('/manager', protect, getManagerOrders);   // 👈 أضفنا هذا السطر ليتطابق مع الـ ApiService في الداشبورد
router.post('/:orderId/notes', protect, addOrderNote); // 👈 مسار إضافة ملاحظات المدير التاريخية
router.patch('/:orderId/status', protect, updateOrderStatus); // مسار تحديث الحالة من الداشبورد
router.patch('/:orderId/close', protect, closeOrder);

module.exports = router;