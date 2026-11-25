const express = require('express');
const router = express.Router();
const { 
  getPublicItems, 
  getManagerItems, 
  createItem, 
  toggleItemStatus // استبدلنا deleteItem بـ toggleItemStatus
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getPublicItems);
router.get('/public', getPublicItems);
router.get('/manager', protect, getManagerItems);
router.post('/', protect, createItem);

// استخدمنا مسار الـ patch مع دالة التفعيل والتعطيل بدل الـ delete
router.patch('/:id/toggle-status', protect, toggleItemStatus);

module.exports = router;