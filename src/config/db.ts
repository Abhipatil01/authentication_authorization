import mongoose from 'mongoose';

export async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('MongoDB connection error!');
    process.exit(1);
  }
}
