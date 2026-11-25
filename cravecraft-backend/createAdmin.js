const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // تأكد إن المسار صحيح لنفس مكان الـ User Model

const run = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/CraveCraft'); // ضع اسم الداتا بيز الصحيح هنا

  // حذف أي أدمن قديم بنفس الاسم لو موجود
  await User.deleteOne({ username: 'admin' });

  // تشفير الباسورد بنفس الطريقة اللي الكنترولر بيقارن بيها
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('123456', salt);

  const admin = new User({
    username: 'admin',
    password: hashedPassword,
    role: 'admin'
  });

  await admin.save();
  console.log('تم إنشاء حساب المدير بنجاح في قاعدة البيانات!');
  process.exit();
};

run();