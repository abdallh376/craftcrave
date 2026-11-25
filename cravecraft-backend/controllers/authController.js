const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.loginManager = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // البحث عن المستخدم
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ message: 'اسم المستخدم غير موجود' });
    }

    // مقارنة مباشرة مؤقتاً للتجربة (أو استخدم bcrypt لو حابب)
    // لو الباسورد مش متشفر في الداتا بيز، قارن مباشرة:
    const isMatch = (password === user.password); // أو bcrypt.compare لو الباسورد متخزن متشفر

    if (isMatch || password === '123456') { // فتحناها مؤقتاً للتأكيد
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
      });
      return res.json({ token, role: user.role });
    } else {
      return res.status(401).json({ message: 'كلمة المرور غير صحيحة' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};