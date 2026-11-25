# تشغيل Stripe في CraveCraft

## ما الذي تم الحفاظ عليه وإضافته؟
- تم الإبقاء على تصميم فاتورة النجاح الأصلي في Angular كما هو داخل `buy.html`.
- بعد الدفع الناجح يرجع العميل إلى `/buy`، ويتم التحقق من جلسة Stripe ثم عرض نفس نافذة الفاتورة الأصلية ببيانات الطلب ورقمه والإجمالي.
- عند إلغاء الدفع يرجع العميل إلى صفحة الشراء وتظل السلة كما هي.
- يتم حفظ بريد العميل داخل `userDetails.email` في MongoDB.
- بعد تأكيد الدفع فقط، يتم خصم المخزون وإرسال إيميل تأكيد الطلب باستخدام دالة `utils/sendEmail.js` الأصلية.
- تم جعل تنفيذ تأكيد الطلب idempotent حتى لا يتكرر خصم المخزون أو إرسال الإيميل عند وصول Webhook والرجوع من Stripe معًا.
- الأسعار والإجمالي يتم حسابهما في Backend من بيانات المنتجات في MongoDB، وليس من إجمالي المتصفح.

## الإعداد
1. داخل مجلد `cravecraft-backend` نفّذ `npm install`.
2. انسخ `.env.example` إلى `.env` وضع بيانات MongoDB ومفتاح Stripe Test Secret Key. لا تشارك مفاتيح Stripe السرية.
3. شغّل الـ Backend باستخدام `npm start`.
4. شغّل Stripe CLI لتوجيه أحداث الدفع إلى السيرفر (الأمر متوافق مع إصدار CLI الذي يطلب تحديد الأحداث):
   ```cmd
   stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed --forward-to localhost:5000/api/orders/webhook
   ```
   إذا لم يكن الأمر `stripe` معروفًا في CMD، استخدم مسار `stripe.exe` الكامل بين علامتي اقتباس، ثم أضف `listen` وباقي الخيارات.
5. انسخ قيمة `whsec_...` التي يعرضها Stripe CLI إلى `STRIPE_WEBHOOK_SECRET` في `.env`، ثم أعد تشغيل Backend.
6. شغّل Angular بالطريقة المعتادة. عنوان الرجوع الافتراضي هو `http://localhost:4200` ويمكن تغييره عبر `FRONTEND_URL`.

## الإيميل
ملف `utils/sendEmail.js` الأصلي يستخدم Mailpit محليًا على `localhost:1025`. لتجربة الإيميل محليًا، شغّل Mailpit وافتح صندوق الرسائل عادةً على `http://localhost:8025`. هذا الإعداد مخصص لالتقاط رسائل الاختبار محليًا؛ إرسال رسائل حقيقية للعملاء يتطلب ضبط SMTP حقيقي بدل إعداد Mailpit المحلي.

## اختبار الدفع
استخدم Stripe Test Mode وبطاقة الاختبار `4242 4242 4242 4242`، تاريخًا مستقبليًا وأي CVC من 3 أرقام. لا تستخدم بيانات بطاقة حقيقية في وضع الاختبار.

## ملاحظات
- العملة الافتراضية `egp` ويمكن تغييرها عبر `STRIPE_CURRENCY`.
- لا تعتبر صفحة النجاح وحدها دليلًا على الدفع؛ Backend يتحقق من Stripe session ويعالج الدفع، كما يتحقق من توقيع Webhook.
- تأكد أن `STRIPE_WEBHOOK_SECRET` يطابق المفتاح الذي يظهر من جلسة `stripe listen` الحالية.
