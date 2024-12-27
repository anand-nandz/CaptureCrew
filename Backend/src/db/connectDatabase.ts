
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri =  process.env.MONGO_ATLAS_URI;
    if (!uri) {
      throw new Error('MONGO_URI or MONGO_ATLAS_URI must be defined');
    }

    const connect = await mongoose.connect(uri)

    console.log(`MongoDB Connected: ${connect.connection.host}`);
  } catch (error) {
    console.error(`Error from DB: ${error}`);
    process.exit(1); // Exit the process with failure
  }
};
