import mongoose from 'mongoose';

let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

export const dbConnection = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.DATABASE_URL, {
      bufferCommands: false,
      maxPoolSize: 2,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
