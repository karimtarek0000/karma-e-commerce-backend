import mongoose from 'mongoose';

export const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Database connection established');
  } catch (error) {
    console.log(error);
  }
};
