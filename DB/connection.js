import mongoose from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error('Please define the DATABASE_URL environment variable inside .env');
}

// تعريف الكاش على الـ global object بشكل آمن ونظيف
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const dbConnection = async () => {
  // 1. لو فيه اتصال جاهز وشغال، استخدمه فوراً
  if (cached.conn) {
    // خطوة إضافية للتأكد أن الاتصال الحالي لم يمت (Ready State == 1)
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    }
    // لو الاتصال مقطوع، صفر الكاش عشان يعمل اتصال جديد
    cached.conn = null;
    cached.promise = null;
  }

  // 2. لو مفيش بروميس شغال، اعمل اتصال جديد
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // الـ Serverless يحتاج Pool Size صغير جداً (1 أو 2 كفاية) لأن كل Function لها حاوية منفصلة
      maxPoolSize: 2, 
      // إعدادات لسرعة اكتشاف الأخطاء وعدم تعليق الفانكشن
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // لو فشل الاتصال، امسح البروميس عشان يحاول تاني المرة الجاية
    throw e;
  }

  return cached.conn;
};
