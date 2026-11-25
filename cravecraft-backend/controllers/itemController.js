const Item = require('../models/Item');

// جلب المنتجات للعامة (النشطة والقديمة التي ليس لها حقل isActive وبدون الكمية)
exports.getPublicItems = async (req, res) => {
  try {
    const items = await Item.find({ 
      $or: [
        { isActive: true }, 
        { isActive: { $exists: false } }
      ] 
    }).select('-quantity');
    
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// جلب المنتجات للمدير (جميع المنتجات مع الكمية والحالة)
exports.getManagerItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// إضافة صنف جديد (للمدير)
exports.createItem = async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// تفعيل أو إيقاف صنف (بدل الحذف النهائي)
exports.toggleItemStatus = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    // عكس الحالة الحالية (لو نشط يصبح معطل والعكس)
    item.isActive = !item.isActive;
    await item.save();

    res.status(200).json({ 
      message: item.isActive ? 'تم تفعيل المنتج بنجاح' : 'تم إيقاف المنتج وإخفاؤه بنجاح', 
      item 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};