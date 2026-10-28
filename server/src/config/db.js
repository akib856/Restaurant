import mongoose from 'mongoose';
mongoose.set('strictQuery', true);
export async function connectDB(uri) {
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
